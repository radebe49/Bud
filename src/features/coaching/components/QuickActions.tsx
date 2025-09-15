import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ActionSuggestion } from '../types/coachingTypes';

interface QuickAction {
  id: string;
  text: string;
  icon: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'tracking';
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  suggestions?: ActionSuggestion[];
  onActionPress: (action: QuickAction) => void;
  onSuggestionPress?: (suggestion: ActionSuggestion) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  suggestions = [],
  onActionPress,
  onSuggestionPress,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness':
        return '#FF6B6B';
      case 'nutrition':
        return '#4ECDC4';
      case 'sleep':
        return '#45B7D1';
      case 'tracking':
        return '#96CEB4';
      default:
        return '#007AFF';
    }
  };

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionButton,
        { borderColor: getCategoryColor(action.category) }
      ]}
      onPress={() => onActionPress(action)}
    >
      <IconSymbol 
        name={action.icon as any} 
        size={16} 
        color={getCategoryColor(action.category)} 
      />
      <ThemedText style={[
        styles.actionText,
        { color: getCategoryColor(action.category) }
      ]}>
        {action.text}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderSuggestion = (suggestion: ActionSuggestion) => (
    <TouchableOpacity
      key={suggestion.id}
      style={[
        styles.suggestionButton,
        suggestion.priority === 'high' && styles.highPrioritySuggestion
      ]}
      onPress={() => onSuggestionPress?.(suggestion)}
    >
      <View style={styles.suggestionContent}>
        <ThemedText style={styles.suggestionTitle}>
          {suggestion.title}
        </ThemedText>
        {suggestion.description && (
          <ThemedText style={styles.suggestionDescription}>
            {suggestion.description}
          </ThemedText>
        )}
      </View>
      {suggestion.estimatedDuration && (
        <ThemedText style={styles.durationText}>
          {suggestion.estimatedDuration}m
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  if (actions.length === 0 && suggestions.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {suggestions.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bud suggests:</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsContainer}>
              {suggestions.map(renderSuggestion)}
            </View>
          </ScrollView>
        </View>
      )}
      
      {actions.length > 0 && (
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.actionsContainer}>
              {actions.map(renderQuickAction)}
            </View>
          </ScrollView>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 200,
    maxWidth: 280,
  },
  highPrioritySuggestion: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 4,
  },
});