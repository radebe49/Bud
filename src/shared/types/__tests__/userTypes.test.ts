/**
 * Type safety tests for user-related interfaces
 * Ensures TypeScript interfaces are properly defined and type-safe
 */

import type {
  UserProfile,
  PersonalInfo,
  ActivityLevel,
  UserGoals,
  Goal,
  GoalType,
  UserPreferences,
  WorkoutType,
  Equipment,
  TimeSlot,
  CommunicationStyle,
  NotificationPreferences,
  PrivacySettings,
  UnitPreferences,
  HealthCondition,
  HealthConditionType,
  ConnectedDevice,
  DeviceType,
  DeviceSettings
} from '../userTypes';

describe('User Types Type Safety', () => {
  
  describe('UserProfile', () => {
    it('should create valid UserProfile object', () => {
      const userProfile: UserProfile = {
        id: 'user-123',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          timezone: 'America/New_York'
        },
        goals: {
          primary: {
            id: 'goal-1',
            type: 'weight_loss',
            title: 'Lose 10kg',
            description: 'Lose weight for better health',
            targetValue: 60,
            currentValue: 70,
            unit: 'kg',
            deadline: new Date('2024-06-01'),
            priority: 'high',
            status: 'active'
          },
          secondary: [],
          timeline: '6 months',
          weeklyWorkoutTarget: 4
        },
        preferences: {
          workoutTypes: ['strength_training', 'cardio'],
          equipment: ['dumbbells', 'yoga_mat'],
          timeAvailability: [{
            dayOfWeek: 1,
            startTime: '07:00',
            endTime: '08:00',
            preference: 'preferred'
          }],
          communicationStyle: 'motivational',
          notifications: {
            workoutReminders: true,
            mealReminders: true,
            sleepReminders: true,
            progressUpdates: true,
            motivationalMessages: true,
            healthAlerts: true,
            quietHours: {
              enabled: true,
              startTime: '22:00',
              endTime: '07:00'
            }
          },
          privacy: {
            shareDataWithCoach: true,
            allowDataAnalytics: true,
            shareProgressWithFriends: false,
            allowThirdPartyIntegrations: true,
            dataRetentionPeriod: 365
          },
          units: {
            weight: 'kg',
            height: 'cm',
            distance: 'km',
            temperature: 'celsius',
            liquid: 'ml'
          }
        },
        healthConditions: [],
        connectedDevices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userProfile).toBeDefined();
      expect(typeof userProfile.id).toBe('string');
      expect(userProfile.createdAt instanceof Date).toBe(true);
    });
  });

  describe('PersonalInfo', () => {
    it('should create valid PersonalInfo object', () => {
      const personalInfo: PersonalInfo = {
        age: 25,
        gender: 'female',
        height: 165,
        weight: 60,
        activityLevel: 'very_active',
        timezone: 'Europe/London'
      };

      expect(personalInfo).toBeDefined();
      expect(typeof personalInfo.age).toBe('number');
      expect(['male', 'female', 'other', 'prefer_not_to_say']).toContain(personalInfo.gender);
    });

    it('should enforce ActivityLevel enum values', () => {
      const validActivityLevels: ActivityLevel[] = [
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active',
        'extremely_active'
      ];

      validActivityLevels.forEach(level => {
        const personalInfo: PersonalInfo = {
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: level,
          timezone: 'UTC'
        };
        expect(personalInfo.activityLevel).toBe(level);
      });
    });
  });

  describe('Goal', () => {
    it('should create valid Goal object', () => {
      const goal: Goal = {
        id: 'goal-123',
        type: 'muscle_gain',
        title: 'Build muscle mass',
        description: 'Increase lean muscle mass by 5kg',
        targetValue: 75,
        currentValue: 70,
        unit: 'kg',
        deadline: new Date('2024-12-31'),
        priority: 'high',
        status: 'active'
      };

      expect(goal).toBeDefined();
      expect(typeof goal.id).toBe('string');
      expect(['low', 'medium', 'high']).toContain(goal.priority);
      expect(['active', 'paused', 'completed', 'cancelled']).toContain(goal.status);
    });

    it('should enforce GoalType enum values', () => {
      const validGoalTypes: GoalType[] = [
        'weight_loss',
        'weight_gain',
        'muscle_gain',
        'endurance',
        'strength',
        'flexibility',
        'sleep_quality',
        'stress_reduction',
        'nutrition_improvement',
        'habit_formation'
      ];

      validGoalTypes.forEach(type => {
        const goal: Goal = {
          id: 'test',
          type: type,
          title: 'Test Goal',
          description: 'Test description',
          priority: 'medium',
          status: 'active'
        };
        expect(goal.type).toBe(type);
      });
    });
  });

  describe('UserPreferences', () => {
    it('should create valid UserPreferences object', () => {
      const preferences: UserPreferences = {
        workoutTypes: ['yoga', 'pilates'],
        equipment: ['yoga_mat', 'resistance_bands'],
        timeAvailability: [{
          dayOfWeek: 0,
          startTime: '08:00',
          endTime: '09:00',
          preference: 'available'
        }],
        communicationStyle: 'supportive',
        notifications: {
          workoutReminders: true,
          mealReminders: false,
          sleepReminders: true,
          progressUpdates: true,
          motivationalMessages: false,
          healthAlerts: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '07:00'
          }
        },
        privacy: {
          shareDataWithCoach: true,
          allowDataAnalytics: false,
          shareProgressWithFriends: false,
          allowThirdPartyIntegrations: true,
          dataRetentionPeriod: 730
        },
        units: {
          weight: 'lbs',
          height: 'ft_in',
          distance: 'miles',
          temperature: 'fahrenheit',
          liquid: 'fl_oz'
        }
      };

      expect(preferences).toBeDefined();
      expect(Array.isArray(preferences.workoutTypes)).toBe(true);
      expect(Array.isArray(preferences.equipment)).toBe(true);
    });

    it('should enforce WorkoutType enum values', () => {
      const validWorkoutTypes: WorkoutType[] = [
        'strength_training',
        'cardio',
        'yoga',
        'pilates',
        'hiit',
        'running',
        'cycling',
        'swimming',
        'martial_arts',
        'dance',
        'sports'
      ];

      const preferences: UserPreferences = {
        workoutTypes: validWorkoutTypes,
        equipment: ['none'],
        timeAvailability: [],
        communicationStyle: 'casual',
        notifications: {
          workoutReminders: true,
          mealReminders: true,
          sleepReminders: true,
          progressUpdates: true,
          motivationalMessages: true,
          healthAlerts: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '07:00'
          }
        },
        privacy: {
          shareDataWithCoach: true,
          allowDataAnalytics: true,
          shareProgressWithFriends: false,
          allowThirdPartyIntegrations: true,
          dataRetentionPeriod: 365
        },
        units: {
          weight: 'kg',
          height: 'cm',
          distance: 'km',
          temperature: 'celsius',
          liquid: 'ml'
        }
      };

      expect(preferences.workoutTypes).toEqual(validWorkoutTypes);
    });

    it('should enforce Equipment enum values', () => {
      const validEquipment: Equipment[] = [
        'none',
        'dumbbells',
        'barbell',
        'resistance_bands',
        'kettlebells',
        'pull_up_bar',
        'yoga_mat',
        'treadmill',
        'stationary_bike',
        'rowing_machine',
        'full_gym'
      ];

      validEquipment.forEach(equipment => {
        const preferences: Partial<UserPreferences> = {
          equipment: [equipment]
        };
        expect(preferences.equipment).toContain(equipment);
      });
    });

    it('should enforce CommunicationStyle enum values', () => {
      const validStyles: CommunicationStyle[] = [
        'motivational',
        'supportive',
        'direct',
        'casual',
        'professional'
      ];

      validStyles.forEach(style => {
        const preferences: Partial<UserPreferences> = {
          communicationStyle: style
        };
        expect(preferences.communicationStyle).toBe(style);
      });
    });
  });

  describe('TimeSlot', () => {
    it('should create valid TimeSlot object', () => {
      const timeSlot: TimeSlot = {
        dayOfWeek: 1, // Monday
        startTime: '07:00',
        endTime: '08:30',
        preference: 'preferred'
      };

      expect(timeSlot).toBeDefined();
      expect(typeof timeSlot.dayOfWeek).toBe('number');
      expect(timeSlot.dayOfWeek >= 0 && timeSlot.dayOfWeek <= 6).toBe(true);
      expect(['preferred', 'available', 'unavailable']).toContain(timeSlot.preference);
    });
  });

  describe('HealthCondition', () => {
    it('should create valid HealthCondition object', () => {
      const condition: HealthCondition = {
        id: 'condition-123',
        name: 'Hypertension',
        type: 'cardiovascular',
        severity: 'moderate',
        diagnosed: true,
        diagnosisDate: new Date('2023-01-15'),
        medications: ['Lisinopril'],
        restrictions: ['Limit sodium intake'],
        notes: 'Monitor blood pressure daily'
      };

      expect(condition).toBeDefined();
      expect(typeof condition.id).toBe('string');
      expect(['mild', 'moderate', 'severe']).toContain(condition.severity);
      expect(Array.isArray(condition.medications)).toBe(true);
      expect(Array.isArray(condition.restrictions)).toBe(true);
    });

    it('should enforce HealthConditionType enum values', () => {
      const validTypes: HealthConditionType[] = [
        'cardiovascular',
        'respiratory',
        'musculoskeletal',
        'metabolic',
        'neurological',
        'mental_health',
        'autoimmune',
        'digestive',
        'hormonal',
        'other'
      ];

      validTypes.forEach(type => {
        const condition: HealthCondition = {
          id: 'test',
          name: 'Test Condition',
          type: type,
          severity: 'mild',
          diagnosed: false,
          medications: [],
          restrictions: []
        };
        expect(condition.type).toBe(type);
      });
    });
  });

  describe('ConnectedDevice', () => {
    it('should create valid ConnectedDevice object', () => {
      const device: ConnectedDevice = {
        id: 'device-123',
        name: 'Apple Watch Series 8',
        type: 'smartwatch',
        brand: 'Apple',
        model: 'Series 8',
        connectionStatus: 'connected',
        lastSyncTime: new Date(),
        dataTypes: ['heart_rate', 'activity_level'],
        settings: {
          syncFrequency: 'real_time',
          dataSharing: true,
          batteryOptimization: false,
          notifications: true
        }
      };

      expect(device).toBeDefined();
      expect(typeof device.id).toBe('string');
      expect(['connected', 'disconnected', 'syncing', 'error']).toContain(device.connectionStatus);
      expect(Array.isArray(device.dataTypes)).toBe(true);
    });

    it('should enforce DeviceType enum values', () => {
      const validDeviceTypes: DeviceType[] = [
        'fitness_tracker',
        'smartwatch',
        'heart_rate_monitor',
        'smart_scale',
        'sleep_tracker',
        'continuous_glucose_monitor',
        'blood_pressure_monitor',
        'smartphone'
      ];

      validDeviceTypes.forEach(type => {
        const device: ConnectedDevice = {
          id: 'test',
          name: 'Test Device',
          type: type,
          brand: 'Test Brand',
          model: 'Test Model',
          connectionStatus: 'connected',
          dataTypes: [],
          settings: {
            syncFrequency: 'daily',
            dataSharing: true,
            batteryOptimization: true,
            notifications: false
          }
        };
        expect(device.type).toBe(type);
      });
    });
  });

  describe('Type compatibility and utility types', () => {
    it('should work with Partial types', () => {
      const partialProfile: Partial<UserProfile> = {
        id: 'user-123',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          timezone: 'UTC'
        }
      };

      expect(partialProfile.id).toBe('user-123');
      expect(partialProfile.goals).toBeUndefined();
    });

    it('should work with Pick utility type', () => {
      type BasicUserInfo = Pick<UserProfile, 'id' | 'personalInfo' | 'createdAt'>;
      
      const basicInfo: BasicUserInfo = {
        id: 'user-123',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          timezone: 'UTC'
        },
        createdAt: new Date()
      };

      expect(basicInfo).toBeDefined();
      expect(typeof basicInfo.id).toBe('string');
    });

    it('should work with Omit utility type', () => {
      type UserWithoutDevices = Omit<UserProfile, 'connectedDevices'>;
      
      const userWithoutDevices: UserWithoutDevices = {
        id: 'user-123',
        personalInfo: {
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          timezone: 'UTC'
        },
        goals: {
          primary: {
            id: 'goal-1',
            type: 'weight_loss',
            title: 'Lose weight',
            description: 'Lose 10kg',
            priority: 'high',
            status: 'active'
          },
          secondary: [],
          timeline: '6 months',
          weeklyWorkoutTarget: 3
        },
        preferences: {
          workoutTypes: ['cardio'],
          equipment: ['none'],
          timeAvailability: [],
          communicationStyle: 'motivational',
          notifications: {
            workoutReminders: true,
            mealReminders: true,
            sleepReminders: true,
            progressUpdates: true,
            motivationalMessages: true,
            healthAlerts: true,
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '07:00'
            }
          },
          privacy: {
            shareDataWithCoach: true,
            allowDataAnalytics: true,
            shareProgressWithFriends: false,
            allowThirdPartyIntegrations: true,
            dataRetentionPeriod: 365
          },
          units: {
            weight: 'kg',
            height: 'cm',
            distance: 'km',
            temperature: 'celsius',
            liquid: 'ml'
          }
        },
        healthConditions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(userWithoutDevices).toBeDefined();
      expect((userWithoutDevices as any).connectedDevices).toBeUndefined();
    });
  });
});