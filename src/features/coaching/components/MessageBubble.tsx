import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage } from '../types/coachingTypes';
import { 
  isLargeScreen,
  getScaleForScreen,
  getSpacingForScreen
} from '../../../shared/utils/animations';

interface MessageBubbleProps {
  message: ChatMessage;
  animationDelay?: number;
  onAnimationComplete?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  animationDelay = 0,
  onAnimationComplete 
}) => {
  const isUser = message.sender === 'user';
  const isBud = message.sender === 'bud';
  
  // Temporarily disable animations to fix Reanimated issue
  useEffect(() => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  }, [onAnimationComplete]);

  const getMessageTypeIcon = () => {
    switch (message.messageType) {
      case 'progress_update':
        return 'chart.bar.fill';
      case 'celebration':
        return 'flame.fill';
      case 'recommendation':
        return 'brain.head.profile';
      case 'insight_banner':
        return 'brain.head.profile';
      case 'question':
        return 'message.fill';
      default:
        return null;
    }
  };

  const getMessageTypeColor = () => {
    switch (message.messageType) {
      case 'progress_update':
        return '#00C851';
      case 'celebration':
        return '#FF9500';
      case 'recommendation':
        return '#007AFF';
      case 'insight_banner':
        return '#5856D6';
      case 'question':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const getBubbleGradient = () => {
    if (isUser) return ['#007AFF', '#5AC8FA'];
    
    switch (message.messageType) {
      case 'progress_update':
        return ['#E8F5E8', '#F0FFF0'];
      case 'celebration':
        return ['#FFF3E0', '#FFFBF0'];
      case 'recommendation':
        return ['#E3F2FD', '#F0F8FF'];
      case 'insight_banner':
        return ['#F3E5F5', '#FAF0FF'];
      default:
        return null;
    }
  };

  const getBubbleStyle = () => {
    if (isUser) return styles.userBubble;
    
    switch (message.messageType) {
      case 'progress_update':
        return [styles.budBubble, styles.progressBubble];
      case 'celebration':
        return [styles.budBubble, styles.celebrationBubble];
      case 'recommendation':
        return [styles.budBubble, styles.recommendationBubble];
      case 'insight_banner':
        return [styles.budBubble, styles.insightBubble];
      default:
        return styles.budBubble;
    }
  };

  const renderBubbleContent = () => (
    <>
      {/* Message type indicator for special messages */}
      {isBud && message.messageType !== 'text' && (
        <View style={styles.messageTypeHeader}>
          <View style={[styles.messageTypeIcon, { backgroundColor: `${getMessageTypeColor()}15` }]}>
            <IconSymbol 
              name={getMessageTypeIcon() as any} 
              size={12} 
              color={getMessageTypeColor()} 
            />
          </View>
          <ThemedText style={[styles.messageTypeLabel, { color: getMessageTypeColor() }]}>
            {message.messageType.replace('_', ' ').toUpperCase()}
          </ThemedText>
        </View>
      )}
      
      <ThemedText
        style={[
          styles.messageText,
          isUser ? styles.userText : styles.budText,
        ]}
      >
        {message.content}
      </ThemedText>
      
      {/* Data logging indicator */}
      {message.metadata?.relatedMetrics && message.metadata.relatedMetrics.length > 0 && (
        <View style={styles.dataIndicator}>
          <View style={styles.dataIconContainer}>
            <IconSymbol name="heart.fill" size={10} color="#00C851" />
          </View>
          <ThemedText style={styles.dataIndicatorText}>
            Data logged: {message.metadata.relatedMetrics.join(', ')}
          </ThemedText>
        </View>
      )}
      
      {/* Timestamp for important messages */}
      {(message.messageType === 'progress_update' || message.messageType === 'celebration') && (
        <ThemedText style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      )}
    </>
  );

  return (
    <View 
      style={[
        styles.container, 
        isUser ? styles.userContainer : styles.budContainer
      ]}
    >
      {isBud && (
        <View style={styles.budAvatarContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={[styles.budAvatar, { 
              width: getScaleForScreen(36), 
              height: getScaleForScreen(36),
              borderRadius: getScaleForScreen(18)
            }]}
          >
            <ThemedText style={[styles.budAvatarText, { 
              fontSize: getScaleForScreen(16) 
            }]}>
              B
            </ThemedText>
          </LinearGradient>
        </View>
      )}
      
      <View style={[styles.bubble, getBubbleStyle()]}>
        {isUser && getBubbleGradient() ? (
          <LinearGradient
            colors={getBubbleGradient()!}
            style={[styles.gradientBubble, {
              borderRadius: getScaleForScreen(24),
              paddingHorizontal: getSpacingForScreen(18),
              paddingVertical: getSpacingForScreen(14),
            }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderBubbleContent()}
          </LinearGradient>
        ) : (
          renderBubbleContent()
        )}
      </View>
      
      {isUser && <View style={[styles.spacer, { width: getSpacingForScreen(48) }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: getSpacingForScreen(20),
    alignItems: 'flex-end',
    paddingHorizontal: getSpacingForScreen(20),
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  budContainer: {
    justifyContent: 'flex-start',
  },
  budAvatarContainer: {
    marginRight: getSpacingForScreen(12),
    marginBottom: getSpacingForScreen(4),
  },
  budAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  budAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bubble: {
    maxWidth: isLargeScreen ? '85%' : '78%',
    borderRadius: getScaleForScreen(24),
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  gradientBubble: {
    paddingHorizontal: getSpacingForScreen(18),
    paddingVertical: getSpacingForScreen(14),
    borderRadius: getScaleForScreen(24),
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: getScaleForScreen(8),
    paddingHorizontal: getSpacingForScreen(18),
    paddingVertical: getSpacingForScreen(14),
  },
  budBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: getScaleForScreen(8),
    paddingHorizontal: getSpacingForScreen(18),
    paddingVertical: getSpacingForScreen(14),
  },
  progressBubble: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#00C851',
    paddingLeft: 16,
  },
  celebrationBubble: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    paddingLeft: 16,
  },
  recommendationBubble: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 16,
  },
  insightBubble: {
    backgroundColor: '#F3E5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#5856D6',
    paddingLeft: 16,
  },
  messageTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  messageTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.8,
  },
  messageText: {
    fontSize: getScaleForScreen(16),
    lineHeight: getScaleForScreen(24),
    fontWeight: '400',
  },
  userText: {
    color: '#FFFFFF',
  },
  budText: {
    color: '#1F2937',
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  dataIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataIndicatorText: {
    fontSize: 12,
    color: '#00C851',
    fontWeight: '600',
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '500',
  },
  spacer: {
    width: 48,
  },
});