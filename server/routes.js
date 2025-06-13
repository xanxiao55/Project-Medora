import { createServer } from "http";
import { storage } from "./storage.js";
import { insertMarathonSchema, insertRegistrationSchema, insertUserSchema } from "../shared/schema.js";
import admin from "firebase-admin";

// Initialize Firebase Admin with environment variables
let firebaseInitialized = false;

try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.VITE_FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  if (!admin.apps.length && process.env.VITE_FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.log("Firebase Admin not configured, authentication disabled");
  firebaseInitialized = false;
}

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  if (!firebaseInitialized) {
    // Skip authentication if Firebase isn't configured
    req.user = { uid: 'demo-user' };
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app) {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Marathon routes
  app.get('/api/marathons', async (req, res) => {
    try {
      const { sort = 'newest', limit } = req.query;
      const marathons = await storage.getMarathons({ sort, limit: limit ? parseInt(limit) : undefined });
      res.json(marathons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/marathons/:id', async (req, res) => {
    try {
      const marathon = await storage.getMarathon(req.params.id);
      if (!marathon) {
        return res.status(404).json({ message: 'Marathon not found' });
      }
      res.json(marathon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/marathons', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const validatedData = insertMarathonSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      const marathon = await storage.createMarathon(validatedData);
      res.json(marathon);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/marathons/:id', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const marathon = await storage.getMarathon(req.params.id);
      if (!marathon) {
        return res.status(404).json({ message: 'Marathon not found' });
      }

      if (marathon.createdBy !== user.id) {
        return res.status(403).json({ message: 'Not authorized to update this marathon' });
      }

      const validatedData = insertMarathonSchema.partial().parse(req.body);
      const updatedMarathon = await storage.updateMarathon(req.params.id, validatedData);
      res.json(updatedMarathon);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/marathons/:id', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const marathon = await storage.getMarathon(req.params.id);
      if (!marathon) {
        return res.status(404).json({ message: 'Marathon not found' });
      }

      if (marathon.createdBy !== user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this marathon' });
      }

      await storage.deleteMarathon(req.params.id);
      res.json({ message: 'Marathon deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/marathons/user/:userId', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.params.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const marathons = await storage.getMarathonsByUser(user.id);
      res.json(marathons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Registration routes
  app.post('/api/registrations', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const validatedData = insertRegistrationSchema.parse({
        ...req.body,
        userId: user.id
      });

      // Check if already registered
      const existingRegistration = await storage.getRegistrationByUserAndMarathon(user.id, req.body.marathonId);
      if (existingRegistration) {
        return res.status(400).json({ message: 'Already registered for this marathon' });
      }

      const registration = await storage.createRegistration(validatedData);
      res.json(registration);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/registrations/user/:userId', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.params.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { search } = req.query;
      const registrations = await storage.getRegistrationsByUser(user.id, search);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/registrations/:id', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to update this registration' });
      }

      // Don't allow updating marathonId, userId, marathonTitle, or startDate
      const { marathonId, userId, ...updateData } = req.body;
      const validatedData = insertRegistrationSchema.partial().parse(updateData);
      
      const updatedRegistration = await storage.updateRegistration(req.params.id, validatedData);
      res.json(updatedRegistration);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/registrations/:id', verifyToken, async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      if (registration.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this registration' });
      }

      await storage.deleteRegistration(req.params.id);
      res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
