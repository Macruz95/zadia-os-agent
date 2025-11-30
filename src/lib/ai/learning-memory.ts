/**
 * ZADIA OS - Learning Memory System
 * 
 * Enables the AI to learn from user interactions within ZADIA OS:
 * 1. Short-term memory: Current conversation context
 * 2. Long-term memory: User preferences, patterns, successful actions
 * 3. Semantic memory: Embeddings for similar context retrieval
 * 
 * This creates a personalized AI experience that improves over time.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UserPreference {
  id?: string;
  userId: string;
  category: 'communication' | 'workflow' | 'data' | 'ui' | 'ai';
  key: string;
  value: unknown;
  confidence: number; // 0-1, increases with repeated observations
  lastUpdated: Date;
  observationCount: number;
}

export interface LearnedPattern {
  id?: string;
  userId: string;
  type: 'action_sequence' | 'time_pattern' | 'context_preference' | 'query_style';
  pattern: string;
  context: Record<string, unknown>;
  frequency: number;
  lastOccurred: Date;
  effectiveness: number; // 0-1, based on user feedback/outcomes
}

export interface SemanticMemory {
  id?: string;
  userId: string;
  content: string;
  contentType: 'query' | 'response' | 'action' | 'feedback' | 'context';
  embedding?: number[]; // For future vector search
  metadata: Record<string, unknown>;
  importance: number; // 0-1
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface LearningContext {
  userId: string;
  preferences: UserPreference[];
  recentPatterns: LearnedPattern[];
  relevantMemories: SemanticMemory[];
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING MEMORY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class LearningMemoryService {
  private static COLLECTION_PREFERENCES = 'ai-user-preferences';
  private static COLLECTION_PATTERNS = 'ai-learned-patterns';
  private static COLLECTION_MEMORIES = 'ai-semantic-memories';

  // ═══════════════════════════════════════════════════════════════════════
  // USER PREFERENCES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Learn a user preference from observation
   */
  static async learnPreference(
    userId: string,
    category: UserPreference['category'],
    key: string,
    value: unknown
  ): Promise<void> {
    try {
      // Check if preference exists
      const q = query(
        collection(db, this.COLLECTION_PREFERENCES),
        where('userId', '==', userId),
        where('category', '==', category),
        where('key', '==', key)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new preference
        await addDoc(collection(db, this.COLLECTION_PREFERENCES), {
          userId,
          category,
          key,
          value,
          confidence: 0.3, // Start with low confidence
          observationCount: 1,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        // Update existing - increase confidence
        const docRef = snapshot.docs[0].ref;
        const current = snapshot.docs[0].data();
        const newConfidence = Math.min(1, (current.confidence || 0.3) + 0.1);
        
        await updateDoc(docRef, {
          value,
          confidence: newConfidence,
          observationCount: increment(1),
          lastUpdated: serverTimestamp(),
        });
      }
      
      logger.info('Learned user preference', {
        component: 'LearningMemory',
        metadata: { userId, category, key }
      });
    } catch (error) {
      logger.error('Error learning preference', error as Error);
    }
  }

  /**
   * Get user preferences by category
   */
  static async getPreferences(
    userId: string,
    category?: UserPreference['category']
  ): Promise<UserPreference[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_PREFERENCES),
        where('userId', '==', userId),
        orderBy('confidence', 'desc'),
        limit(50)
      );
      
      if (category) {
        q = query(
          collection(db, this.COLLECTION_PREFERENCES),
          where('userId', '==', userId),
          where('category', '==', category),
          orderBy('confidence', 'desc'),
          limit(20)
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
      })) as UserPreference[];
    } catch (error) {
      logger.error('Error getting preferences', error as Error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LEARNED PATTERNS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Record a pattern observation
   */
  static async recordPattern(
    userId: string,
    type: LearnedPattern['type'],
    pattern: string,
    context: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_PATTERNS),
        where('userId', '==', userId),
        where('type', '==', type),
        where('pattern', '==', pattern)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, this.COLLECTION_PATTERNS), {
          userId,
          type,
          pattern,
          context,
          frequency: 1,
          effectiveness: 0.5, // Neutral start
          lastOccurred: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          frequency: increment(1),
          context,
          lastOccurred: serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('Error recording pattern', error as Error);
    }
  }

  /**
   * Update pattern effectiveness based on outcome
   */
  static async updatePatternEffectiveness(
    patternId: string,
    wasSuccessful: boolean
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_PATTERNS, patternId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const current = docSnap.data().effectiveness || 0.5;
        const adjustment = wasSuccessful ? 0.1 : -0.05;
        const newEffectiveness = Math.max(0, Math.min(1, current + adjustment));
        
        await updateDoc(docRef, {
          effectiveness: newEffectiveness,
          lastOccurred: serverTimestamp(),
        });
      }
    } catch (error) {
      logger.error('Error updating pattern effectiveness', error as Error);
    }
  }

  /**
   * Get most effective patterns for user
   */
  static async getEffectivePatterns(
    userId: string,
    type?: LearnedPattern['type']
  ): Promise<LearnedPattern[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_PATTERNS),
        where('userId', '==', userId),
        orderBy('effectiveness', 'desc'),
        limit(20)
      );
      
      if (type) {
        q = query(
          collection(db, this.COLLECTION_PATTERNS),
          where('userId', '==', userId),
          where('type', '==', type),
          orderBy('effectiveness', 'desc'),
          limit(10)
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastOccurred: doc.data().lastOccurred?.toDate() || new Date(),
      })) as LearnedPattern[];
    } catch (error) {
      logger.error('Error getting patterns', error as Error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SEMANTIC MEMORY
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Store a memory for future retrieval
   */
  static async storeMemory(
    userId: string,
    content: string,
    contentType: SemanticMemory['contentType'],
    metadata: Record<string, unknown> = {},
    importance: number = 0.5
  ): Promise<string> {
    try {
      // Sanitize metadata - remove undefined values (Firestore doesn't accept them)
      const sanitizedMetadata: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(metadata)) {
        if (value !== undefined) {
          sanitizedMetadata[key] = value;
        }
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_MEMORIES), {
        userId,
        content,
        contentType,
        metadata: sanitizedMetadata,
        importance,
        accessCount: 0,
        createdAt: serverTimestamp(),
        lastAccessed: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error) {
      logger.error('Error storing memory', error as Error);
      return '';
    }
  }

  /**
   * Get recent memories by type
   */
  static async getRecentMemories(
    userId: string,
    contentType?: SemanticMemory['contentType'],
    maxCount: number = 10
  ): Promise<SemanticMemory[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_MEMORIES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );
      
      if (contentType) {
        q = query(
          collection(db, this.COLLECTION_MEMORIES),
          where('userId', '==', userId),
          where('contentType', '==', contentType),
          orderBy('createdAt', 'desc'),
          limit(maxCount)
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastAccessed: doc.data().lastAccessed?.toDate() || new Date(),
      })) as SemanticMemory[];
    } catch (error) {
      logger.error('Error getting memories', error as Error);
      return [];
    }
  }

  /**
   * Search memories by content similarity (basic keyword matching for now)
   * TODO: Implement vector similarity search with embeddings
   */
  static async searchMemories(
    userId: string,
    searchQuery: string,
    maxCount: number = 5
  ): Promise<SemanticMemory[]> {
    try {
      // For now, get recent memories and filter client-side
      // In production, use vector database or Firestore full-text search
      const memories = await this.getRecentMemories(userId, undefined, 50);
      
      const queryWords = searchQuery.toLowerCase().split(/\s+/);
      
      const scored = memories.map(memory => {
        const content = memory.content.toLowerCase();
        const matchCount = queryWords.filter(word => content.includes(word)).length;
        const score = matchCount / queryWords.length;
        return { memory, score };
      });
      
      return scored
        .filter(s => s.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxCount)
        .map(s => s.memory);
    } catch (error) {
      logger.error('Error searching memories', error as Error);
      return [];
    }
  }

  /**
   * Mark memory as accessed (for importance tracking)
   */
  static async accessMemory(memoryId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_MEMORIES, memoryId);
      await updateDoc(docRef, {
        accessCount: increment(1),
        lastAccessed: serverTimestamp(),
      });
    } catch (error) {
      logger.error('Error accessing memory', error as Error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // LEARNING CONTEXT BUILDER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Build complete learning context for AI
   */
  static async buildLearningContext(
    userId: string,
    currentQuery?: string
  ): Promise<LearningContext> {
    try {
      const [preferences, patterns, memories] = await Promise.all([
        this.getPreferences(userId),
        this.getEffectivePatterns(userId),
        currentQuery 
          ? this.searchMemories(userId, currentQuery, 5)
          : this.getRecentMemories(userId, undefined, 5),
      ]);
      
      return {
        userId,
        preferences: preferences.filter(p => p.confidence > 0.5),
        recentPatterns: patterns.filter(p => p.effectiveness > 0.5),
        relevantMemories: memories,
      };
    } catch (error) {
      logger.error('Error building learning context', error as Error);
      return {
        userId,
        preferences: [],
        recentPatterns: [],
        relevantMemories: [],
      };
    }
  }

  /**
   * Generate learning context as string for AI prompt
   */
  static formatLearningContext(context: LearningContext): string {
    const sections: string[] = [];
    
    if (context.preferences.length > 0) {
      const prefLines = context.preferences.slice(0, 5).map(p => 
        `- ${p.category}/${p.key}: ${JSON.stringify(p.value)} (confianza: ${Math.round(p.confidence * 100)}%)`
      );
      sections.push(`PREFERENCIAS DEL USUARIO:\n${prefLines.join('\n')}`);
    }
    
    if (context.recentPatterns.length > 0) {
      const patternLines = context.recentPatterns.slice(0, 3).map(p =>
        `- ${p.type}: "${p.pattern}" (frecuencia: ${p.frequency}, efectividad: ${Math.round(p.effectiveness * 100)}%)`
      );
      sections.push(`PATRONES OBSERVADOS:\n${patternLines.join('\n')}`);
    }
    
    if (context.relevantMemories.length > 0) {
      const memoryLines = context.relevantMemories.slice(0, 3).map(m =>
        `- [${m.contentType}] ${m.content.slice(0, 100)}${m.content.length > 100 ? '...' : ''}`
      );
      sections.push(`CONTEXTO RELEVANTE:\n${memoryLines.join('\n')}`);
    }
    
    return sections.length > 0 
      ? `\n📚 APRENDIZAJE PERSONALIZADO:\n${sections.join('\n\n')}\n`
      : '';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AUTOMATIC LEARNING FROM INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Learn from a user interaction
   */
  static async learnFromInteraction(
    userId: string,
    query: string,
    response: string,
    action?: { tool: string; success: boolean },
    feedback?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    try {
      // Build metadata without undefined values (Firestore doesn't accept undefined)
      const metadata: Record<string, unknown> = {
        hasAction: !!action,
      };
      
      if (action) {
        metadata.actionTool = action.tool;
        metadata.actionSuccess = action.success;
      }
      
      if (feedback) {
        metadata.feedback = feedback;
      }

      // Store the interaction as memory
      await this.storeMemory(
        userId,
        `Q: ${query.slice(0, 200)}\nA: ${response.slice(0, 300)}`,
        action ? 'action' : 'response',
        metadata,
        feedback === 'positive' ? 0.8 : feedback === 'negative' ? 0.2 : 0.5
      );
      
      // Learn query patterns
      if (query.length > 10) {
        // Detect question type pattern
        const questionPatterns = [
          { pattern: /^(qué|que|what)/i, type: 'question_what' },
          { pattern: /^(cómo|como|how)/i, type: 'question_how' },
          { pattern: /^(cuánto|cuanto|cuántos|cuantos|how much|how many)/i, type: 'question_quantity' },
          { pattern: /^(por qué|porque|why)/i, type: 'question_why' },
          { pattern: /^(cuándo|cuando|when)/i, type: 'question_when' },
          { pattern: /(crea|crear|create|nuevo|new|registra)/i, type: 'action_create' },
          { pattern: /(analiza|analyze|análisis|analysis)/i, type: 'action_analyze' },
          { pattern: /(busca|search|encuentra|find)/i, type: 'action_search' },
        ];
        
        for (const { pattern, type } of questionPatterns) {
          if (pattern.test(query)) {
            await this.recordPattern(userId, 'query_style', type, { exampleQuery: query.slice(0, 100) });
            break;
          }
        }
      }
      
      // Learn from successful actions
      if (action?.success) {
        await this.learnPreference(userId, 'workflow', `preferred_action_${action.tool}`, true);
      }
      
      // Learn from feedback
      if (feedback === 'positive') {
        // Increase importance of this interaction style
        await this.recordPattern(userId, 'context_preference', 'positive_interaction', {
          queryLength: query.length,
          responseLength: response.length,
          hadAction: !!action,
        });
      }
      
    } catch (error) {
      logger.error('Error learning from interaction', error as Error);
    }
  }

  /**
   * Learn from ZADIA OS module usage
   */
  static async learnFromModuleUsage(
    userId: string,
    module: string,
    action: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Record time-based patterns
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      
      await this.recordPattern(
        userId,
        'time_pattern',
        `${module}_${action}_hour_${hour}`,
        { hour, dayOfWeek, ...context }
      );
      
      // Record action sequences
      await this.recordPattern(
        userId,
        'action_sequence',
        `${module}:${action}`,
        context || {}
      );
      
      // Learn module preferences
      await this.learnPreference(userId, 'workflow', `frequent_module`, module);
      
    } catch (error) {
      logger.error('Error learning from module usage', error as Error);
    }
  }
}

export default LearningMemoryService;
