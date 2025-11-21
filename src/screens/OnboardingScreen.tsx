import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { setHasSeenOnboarding } from '../utils/storageManager';
import { NavigationProp } from '../types/navigationTypes';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  color: string;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      icon: 'home-heart',
      title: t('onboarding.welcome.title', { defaultValue: 'Bem-vindo!' }),
      description: t('onboarding.welcome.description', {
        defaultValue: 'Criar contratos de locação agora é simples e rápido. Siga o passo a passo!',
      }),
      color: '#1976d2',
    },
    {
      icon: 'account-group',
      title: t('onboarding.profiles.title', { defaultValue: '1. Cadastre os Dados' }),
      description: t('onboarding.profiles.description', {
        defaultValue: 'Primeiro, vá em "Proprietários" e "Residências" para cadastrar os dados. Você só precisa fazer isso uma vez!',
      }),
      color: '#388e3c',
    },
    {
      icon: 'file-document-edit',
      title: t('onboarding.customization.title', { defaultValue: '2. Personalize (Opcional)' }),
      description: t('onboarding.customization.description', {
        defaultValue: 'Nas configurações, você pode editar cláusulas e criar modelos personalizados para diferentes situações.',
      }),
      color: '#f57c00',
    },
    {
      icon: 'lightning-bolt',
      title: t('onboarding.generate.title', { defaultValue: '3. Crie o Contrato' }),
      description: t('onboarding.generate.description', {
        defaultValue: 'Clique em "Novo Contrato", selecione o proprietário e residência, preencha os dados do inquilino e pronto!',
      }),
      color: '#7b1fa2',
    },
  ];

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    }
  };

  const handleGetStarted = async () => {
    await setHasSeenOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' as any }],
    });
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
              <MaterialCommunityIcons name={slide.icon} size={80} color="#fff" />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isLastSlide ? (
          <>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleGetStarted}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>
                {t('onboarding.skip', { defaultValue: 'Pular' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={scrollToNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {t('onboarding.next', { defaultValue: 'Próximo' })}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.7}
          >
            <Text style={styles.getStartedButtonText}>
              {t('onboarding.getStarted', { defaultValue: 'Começar' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1976d2',
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
  getStartedButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1976d2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  getStartedButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});
