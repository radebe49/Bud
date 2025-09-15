import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { FixedHeader } from '@/shared/components/FixedHeader';

import { ConversationService, DataLoggingResult } from '../services/conversationService';
import { ChatMessage, ConversationContext, ActionSuggestion } from '../types/coachingTypes';
import { UUID } from '@/shared/types/globalTypes';
import { onboardingService } from '../../auth/services/onboardingService';
import { storageService } from '@/shared/services/storageService';



export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const conversationService = ConversationService.getInstance();

  // Initialize with personalized welcome message
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Get user profile to personalize welcome message
      const userProfile = await storageService.getUserProfile<any>();
      let welcomeContent = "Hey there! I'm Bud, your AI health coach. I'm here to help you track your health data and reach your wellness goals. How are you feeling today?";
      
      if (userProfile?.onboardingData?.goals) {
        // Generate personalized welcome message based on onboarding data
        welcomeContent = onboardingService.generateWelcomeMessage(userProfile.onboardingData.goals);
        welcomeContent += "\n\nI remember your goals from our setup. Ready to start working towards them?";
      }

      const welcomeMessage: ChatMessage = {
        id: generateId(),
        content: welcomeContent,
        sender: 'bud',
        timestamp: new Date(),
        messageType: 'text',
        context: createInitialContext(),
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Fallback to default welcome message
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        content: "Hey there! I'm Bud, your AI health coach. I'm here to help you track your health data and reach your wellness goals. How are you feeling today?",
        sender: 'bud',
        timestamp: new Date(),
        messageType: 'text',
        context: createInitialContext(),
      };
      setMessages([welcomeMessage]);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const createInitialContext = (): ConversationContext => ({
    sessionId: generateId(),
    userId: 'current-user', // This would come from auth
    currentTopic: 'general',
    recentMetrics: {
      timestamp: new Date(),
    },
    activeGoals: [],
    conversationHistory: [],
    contextualFactors: [],
    lastInteraction: new Date(),
  });

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      messageType: 'text',
      context: createInitialContext(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Process message with conversation service
      const context = createInitialContext();
      context.conversationHistory = messages;
      
      const result = await conversationService.processMessage(inputText.trim(), context);
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, result.response]);
        
        // Update suggestions if any
        if (result.response.suggestions) {
          setSuggestions(result.response.suggestions);
        }
        
        // Show data logging confirmation if successful
        if (result.dataLogged?.success) {
          showDataLoggingFeedback(result.dataLogged);
        }
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
    } catch (error) {
      setIsTyping(false);
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "Sorry, I'm having trouble processing that right now. Could you try again?",
        sender: 'bud',
        timestamp: new Date(),
        messageType: 'text',
        context: createInitialContext(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const showDataLoggingFeedback = (dataResult: DataLoggingResult) => {
    if (dataResult.dataLogged && dataResult.dataLogged.length > 0) {
      const dataPoint = dataResult.dataLogged[0];
      const metricName = dataPoint.metric.replace('_', ' ');
      const value = dataPoint.value;
      const unit = dataPoint.unit;
      
      let message = `Successfully logged: ${metricName}`;
      if (value && unit) {
        message += ` (${value} ${unit})`;
      }
      message += '\n\nKeep up the great work with tracking your health data!';
      
      Alert.alert(
        'Data Logged! 📊',
        message,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  };

  const handleSuggestionPress = (suggestion: ActionSuggestion) => {
    // Convert suggestion to a message
    const suggestionText = `I'd like to ${suggestion.title.toLowerCase()}`;
    setInputText(suggestionText);
  };

  const generateId = (): UUID => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FixedHeader onProfilePress={() => {
        // TODO: Navigate to profile screen
        console.log('Profile pressed');
      }} />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator visible={isTyping} />}
        </ScrollView>



        <ThemedView style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            {!inputText.trim() && (
              <View style={styles.placeholderIcons}>
                <TouchableOpacity 
                  style={styles.placeholderIconButton}
                  onPress={() => {
                    // TODO: Implement voice input
                    console.log('Voice input pressed');
                  }}
                >
                  <IconSymbol 
                    name="mic.fill" 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.placeholderIconButton}
                  onPress={() => {
                    // TODO: Implement camera/scanning input
                    console.log('Camera input pressed');
                  }}
                >
                  <IconSymbol 
                    name="camera.fill" 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <IconSymbol 
              name="arrow.up" 
              size={20} 
              color={inputText.trim() && !isTyping ? "#FFF" : "#999"} 
            />
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  content: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  textInputContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 80, // Make room for placeholder icons
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  placeholderIcons: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -18 }], // Center vertically (half of icon container height)
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
});