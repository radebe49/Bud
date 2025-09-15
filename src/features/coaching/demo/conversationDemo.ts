/**
 * Demo script showcasing the conversation engine capabilities
 */

import { ConversationEngine } from '../services/conversationEngine';
import { QuickActionGenerator } from '../services/quickActionGenerator';
import { MockResponseDatabase } from '../services/mockResponseDatabase';

export class ConversationDemo {
  private engine: ConversationEngine;
  private quickActions: QuickActionGenerator;
  private mockDb: MockResponseDatabase;

  constructor() {
    this.engine = ConversationEngine.getInstance();
    this.quickActions = QuickActionGenerator.getInstance();
    this.mockDb = MockResponseDatabase.getInstance();
  }

  public async runDemo(): Promise<void> {
    console.log('🤖 Bud Health Coach - Conversation Engine Demo\n');

    const demoMessages = [
      'Hello Bud!',
      'I slept 8 hours last night',
      'I worked out this morning for 45 minutes',
      'My energy level is 7 out of 10',
      'I feel a bit stressed today',
      'I ate a healthy breakfast',
      'I drank 2 glasses of water',
      'I weigh 150 lbs today',
      'I feel motivated to exercise'
    ];

    const userId = 'demo-user';
    const sessionId = 'demo-session';

    for (let i = 0; i < demoMessages.length; i++) {
      const message = demoMessages[i];
      console.log(`👤 User: ${message}`);

      try {
        const result = await this.engine.processMessage(message, userId, sessionId);
        
        console.log(`🤖 Bud: ${result.response.content}`);
        
        if (result.dataLogged && result.dataLogged.length > 0) {
          console.log('📊 Data logged:');
          result.dataLogged.forEach(data => {
            console.log(`   - ${data.metric}: ${data.value} ${data.unit}`);
          });
        }

        if (result.response.suggestions && result.response.suggestions.length > 0) {
          console.log('💡 Quick actions:');
          result.response.suggestions.slice(0, 3).forEach(suggestion => {
            console.log(`   - ${suggestion.title}: ${suggestion.description}`);
          });
        }

        console.log('---\n');
        
        // Add a small delay to make the demo more readable
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error processing message: ${error}`);
      }
    }

    // Show final context
    const finalContext = this.engine.getActiveContext(sessionId);
    if (finalContext) {
      console.log('📈 Final conversation context:');
      console.log(`   - Messages exchanged: ${finalContext.conversationHistory.length}`);
      console.log(`   - Current topic: ${finalContext.currentTopic}`);
      if (finalContext.userMood) {
        console.log(`   - User mood: Energy ${finalContext.userMood.energy}/10, Stress ${finalContext.userMood.stress}/10`);
      }
    }
  }

  public demonstrateResponseDatabase(): void {
    console.log('\n🗃️ Mock Response Database Demo\n');

    const categories = this.mockDb.getAllCategories();
    console.log(`Available categories: ${categories.join(', ')}`);

    // Show sample responses from different categories
    const sampleCategories = ['greetings', 'sleep', 'fitness', 'nutrition'];
    
    sampleCategories.forEach(category => {
      const subcategories = this.mockDb.getSubcategories(category);
      if (subcategories.length > 0) {
        const response = this.mockDb.getResponse(category, subcategories[0]);
        if (response) {
          console.log(`\n${category.toUpperCase()} - ${subcategories[0]}:`);
          console.log(`"${response.content}"`);
          if (response.suggestions && response.suggestions.length > 0) {
            console.log(`Suggestions: ${response.suggestions.map(s => s.title).join(', ')}`);
          }
        }
      }
    });
  }

  public demonstrateQuickActions(): void {
    console.log('\n⚡ Quick Action Generator Demo\n');

    // Create sample contexts for different scenarios
    const scenarios = [
      {
        name: 'Morning User',
        context: {
          sessionId: 'morning-demo',
          userId: 'morning-user',
          currentTopic: 'general' as const,
          recentMetrics: { timestamp: new Date() },
          activeGoals: [],
          conversationHistory: [],
          contextualFactors: [],
          lastInteraction: new Date(),
          userMood: {
            energy: 8,
            motivation: 7,
            stress: 3,
            confidence: 7,
            timestamp: new Date()
          }
        }
      },
      {
        name: 'Stressed User',
        context: {
          sessionId: 'stress-demo',
          userId: 'stress-user',
          currentTopic: 'stress_management' as const,
          recentMetrics: { timestamp: new Date() },
          activeGoals: [],
          conversationHistory: [],
          contextualFactors: [],
          lastInteraction: new Date(),
          userMood: {
            energy: 4,
            motivation: 3,
            stress: 8,
            confidence: 4,
            timestamp: new Date()
          }
        }
      },
      {
        name: 'Evening User',
        context: {
          sessionId: 'evening-demo',
          userId: 'evening-user',
          currentTopic: 'sleep' as const,
          recentMetrics: { timestamp: new Date() },
          activeGoals: [],
          conversationHistory: [],
          contextualFactors: [],
          lastInteraction: new Date()
        }
      }
    ];

    scenarios.forEach(scenario => {
      console.log(`\n${scenario.name}:`);
      const actions = this.quickActions.generateQuickActions(scenario.context);
      actions.forEach(action => {
        console.log(`  • ${action.title} (${action.category}, ${action.estimatedDuration}min)`);
        console.log(`    ${action.description}`);
      });
    });

    // Demonstrate contextual actions
    console.log('\nContextual Actions for specific messages:');
    const contextualMessages = [
      'I feel really tired today',
      'I just finished an amazing workout!',
      'I\'m feeling stressed about work'
    ];

    const baseContext = scenarios[0].context;
    contextualMessages.forEach(message => {
      console.log(`\nMessage: "${message}"`);
      const actions = this.quickActions.generateContextualActions(message, baseContext);
      actions.forEach(action => {
        console.log(`  • ${action.title}: ${action.description}`);
      });
    });
  }
}

// Export a function to run the full demo
export async function runConversationDemo(): Promise<void> {
  const demo = new ConversationDemo();
  
  await demo.runDemo();
  demo.demonstrateResponseDatabase();
  demo.demonstrateQuickActions();
  
  console.log('\n✅ Demo completed!');
}

// Allow running the demo directly
if (require.main === module) {
  runConversationDemo().catch(console.error);
}