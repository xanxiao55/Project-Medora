import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

export class MongoStorage {
  constructor() {
    this.client = null;
    this.db = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    // Use MongoDB Atlas URI if provided, otherwise fallback to local
    const atlasUri = "mongodb+srv://xanxiao55:xanxiao55@cluster0.e9sx5tj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const uri = process.env.MONGODB_URI || atlasUri;
    
    try {
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      await this.client.connect();
      await this.client.db("admin").command({ ping: 1 });
      this.db = this.client.db("marathonhub");
      this.connected = true;
      this.useMemoryStorage = false;
      console.log("✓ Connected to MongoDB Atlas successfully with native driver");
      
      // Create indexes for better performance
      await this.createIndexes();
    } catch (error) {
      console.log("MongoDB Atlas not available, using in-memory storage");
      console.log("Error:", error.message);
      this.useMemoryStorage = true;
      this.memoryData = {
        users: new Map(),
        marathons: new Map(),
        registrations: new Map(),
        currentId: 1
      };
      this.connected = true; // Mark as connected to prevent retry
    }
  }

  async createIndexes() {
    if (!this.db) return;
    
    try {
      await this.db.collection("users").createIndex({ firebaseUid: 1 }, { unique: true });
      await this.db.collection("users").createIndex({ id: 1 }, { unique: true });
      await this.db.collection("marathons").createIndex({ id: 1 }, { unique: true });
      await this.db.collection("marathons").createIndex({ createdBy: 1 });
      await this.db.collection("registrations").createIndex({ id: 1 }, { unique: true });
      await this.db.collection("registrations").createIndex({ userId: 1 });
      await this.db.collection("registrations").createIndex({ marathonId: 1 });
      await this.db.collection("registrations").createIndex({ userId: 1, marathonId: 1 }, { unique: true });
    } catch (error) {
      console.log("Index creation completed (some may already exist)");
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
    }
  }

  // User methods
  async createUser(userData) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const user = {
        ...userData,
        id: (this.memoryData.currentId++).toString(),
        createdAt: new Date(),
      };
      this.memoryData.users.set(user.id, user);
      return user;
    }
    
    const user = {
      ...userData,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    };
    await this.db.collection("users").insertOne(user);
    return user;
  }

  async getUserByFirebaseUid(firebaseUid) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      for (const user of this.memoryData.users.values()) {
        if (user.firebaseUid === firebaseUid) {
          return user;
        }
      }
      return null;
    }
    
    return await this.db.collection("users").findOne({ firebaseUid });
  }

  async getUser(id) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      return this.memoryData.users.get(id) || null;
    }
    
    return await this.db.collection("users").findOne({ id });
  }

  // Marathon methods
  async createMarathon(marathonData) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const marathon = {
        ...marathonData,
        id: (this.memoryData.currentId++).toString(),
        totalRegistration: 0,
        createdAt: new Date(),
      };
      this.memoryData.marathons.set(marathon.id, marathon);
      return marathon;
    }
    
    const marathon = {
      ...marathonData,
      id: new ObjectId().toString(),
      totalRegistration: 0,
      createdAt: new Date(),
    };
    await this.db.collection("marathons").insertOne(marathon);
    return marathon;
  }

  async getMarathons({ sort = 'newest', limit } = {}) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      let marathons = Array.from(this.memoryData.marathons.values());
      
      if (sort === 'newest') {
        marathons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'oldest') {
        marathons.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
      
      if (limit) {
        marathons = marathons.slice(0, limit);
      }
      
      return marathons;
    }
    
    let query = this.db.collection("marathons").find({});
    
    if (sort === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sort === 'oldest') {
      query = query.sort({ createdAt: 1 });
    }

    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  async getMarathon(id) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      return this.memoryData.marathons.get(id) || null;
    }
    
    return await this.db.collection("marathons").findOne({ id });
  }

  async updateMarathon(id, updateData) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const marathon = this.memoryData.marathons.get(id);
      if (marathon) {
        const updated = { ...marathon, ...updateData };
        this.memoryData.marathons.set(id, updated);
        return updated;
      }
      return null;
    }
    
    const result = await this.db.collection("marathons").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async deleteMarathon(id) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      // Delete all registrations for this marathon
      for (const [regId, reg] of this.memoryData.registrations.entries()) {
        if (reg.marathonId === id) {
          this.memoryData.registrations.delete(regId);
        }
      }
      return this.memoryData.marathons.delete(id);
    }
    
    await this.db.collection("registrations").deleteMany({ marathonId: id });
    return await this.db.collection("marathons").deleteOne({ id });
  }

  async getMarathonsByUser(userId) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const marathons = Array.from(this.memoryData.marathons.values())
        .filter(m => m.createdBy === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return marathons;
    }
    
    return await this.db.collection("marathons").find({ createdBy: userId }).sort({ createdAt: -1 }).toArray();
  }

  // Registration methods
  async createRegistration(registrationData) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const registration = {
        ...registrationData,
        id: (this.memoryData.currentId++).toString(),
        createdAt: new Date(),
      };
      
      this.memoryData.registrations.set(registration.id, registration);
      
      // Increment marathon registration count
      const marathon = this.memoryData.marathons.get(registrationData.marathonId);
      if (marathon) {
        marathon.totalRegistration = (marathon.totalRegistration || 0) + 1;
        this.memoryData.marathons.set(marathon.id, marathon);
      }
      
      return registration;
    }
    
    const registration = {
      ...registrationData,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    };
    
    await this.db.collection("registrations").insertOne(registration);
    
    await this.db.collection("marathons").updateOne(
      { id: registrationData.marathonId },
      { $inc: { totalRegistration: 1 } }
    );

    return registration;
  }

  async getRegistration(id) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      return this.memoryData.registrations.get(id) || null;
    }
    
    return await this.db.collection("registrations").findOne({ id });
  }

  async getRegistrationByUserAndMarathon(userId, marathonId) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      for (const registration of this.memoryData.registrations.values()) {
        if (registration.userId === userId && registration.marathonId === marathonId) {
          return registration;
        }
      }
      return null;
    }
    
    return await this.db.collection("registrations").findOne({ userId, marathonId });
  }

  async getRegistrationsByUser(userId, search) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      let registrations = Array.from(this.memoryData.registrations.values())
        .filter(r => r.userId === userId);
      
      // Add marathon data to each registration
      registrations = registrations.map(registration => {
        const marathon = this.memoryData.marathons.get(registration.marathonId);
        return {
          ...registration,
          marathon: marathon || null
        };
      });
      
      if (search) {
        registrations = registrations.filter(r => {
          const marathon = r.marathon;
          return marathon && marathon.title && marathon.title.toLowerCase().includes(search.toLowerCase());
        });
      }
      
      return registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Use aggregation pipeline to join with marathons collection
    const pipeline = [
      { $match: { userId } },
      {
        $lookup: {
          from: "marathons",
          localField: "marathonId",
          foreignField: "id",
          as: "marathon"
        }
      },
      { $unwind: { path: "$marathon", preserveNullAndEmptyArrays: true } }
    ];

    if (search) {
      pipeline.push({
        $match: {
          "marathon.title": { $regex: search, $options: "i" }
        }
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    
    return await this.db.collection("registrations").aggregate(pipeline).toArray();
  }

  async updateRegistration(id, updateData) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const registration = this.memoryData.registrations.get(id);
      if (registration) {
        const updated = { ...registration, ...updateData };
        this.memoryData.registrations.set(id, updated);
        return updated;
      }
      return null;
    }
    
    const result = await this.db.collection("registrations").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async deleteRegistration(id) {
    await this.connect();
    
    if (this.useMemoryStorage) {
      const registration = this.memoryData.registrations.get(id);
      if (registration) {
        // Decrement marathon registration count
        const marathon = this.memoryData.marathons.get(registration.marathonId);
        if (marathon && marathon.totalRegistration > 0) {
          marathon.totalRegistration--;
          this.memoryData.marathons.set(marathon.id, marathon);
        }
        
        return this.memoryData.registrations.delete(id);
      }
      return false;
    }
    
    const registration = await this.getRegistration(id);
    if (registration) {
      await this.db.collection("marathons").updateOne(
        { id: registration.marathonId },
        { $inc: { totalRegistration: -1 } }
      );
    }
    
    return await this.db.collection("registrations").deleteOne({ id });
  }
}

export const storage = new MongoStorage();

// Initialize the connection immediately
storage.connect().then(() => {
  console.log("Storage initialized successfully");
}).catch((error) => {
  console.error("Storage initialization error:", error);
});