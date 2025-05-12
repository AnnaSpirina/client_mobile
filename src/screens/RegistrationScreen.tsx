import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import { ScrollView } from 'react-native';
import * as yup from 'yup';
import api from '../services/api';

type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
};

type FormValues = {
  surname: string;
  name: string;
  patronymic: string;
  email: string;
  programId: string;
  yearAdmission: string;
  group: string;
};

type Program = {
  id: number;
  name: string;
};

const registrationSchema = yup.object().shape({
  surname: yup.string().required('Фамилия обязательна'),
  name: yup.string().required('Имя обязательно'),
  email: yup
    .string()
    .required('Email обязателен')
    .email('Некорректный формат email')
    .matches(
      /^[A-Za-z0-9._%+-]+@edu\.hse\.ru$/,
      'Только корпоративные email @edu.hse.ru'
    )
    .test(
      'email-available',
      'Email уже зарегистрирован',
      async (value) => {
        try {
          const response = await api.get(`/api/check-email?email=${encodeURIComponent(value)}`);
          return response.data.available;
        } catch {
          return false;
        }
      }
    ),
  programId: yup.string().required('Выберите направление'),
  yearAdmission: yup.string().required('Укажите год поступления'),
  group: yup.string().required('Укажите группу'),
});

export default function RegistrationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await api.get('/api/programs');
        setPrograms(response.data);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить направления');
      }
    };
    loadPrograms();
  }, []);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await api.post('/api/register', values);
      Alert.alert(
        'Успешно!',
        'Регистрация завершена. Пароль отправлен на вашу почту.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.message || 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const groups = [1, 2, 3, 4, 5];

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      keyboardShouldPersistTaps="handled"  // Чтобы клавиатура не мешала скроллу
    >
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Регистрация</Text>
        
        <Formik
          initialValues={{
            surname: '',
            name: '',
            patronymic: '',
            email: '',
            programId: '',
            yearAdmission: '',
            group: '',
          }}
          validationSchema={registrationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <TextInput
                placeholder="Фамилия"
                placeholderTextColor="#A4A4A4"
                onChangeText={handleChange('surname')}
                onBlur={handleBlur('surname')}
                value={values.surname}
                style={styles.input}
              />
              {touched.surname && errors.surname && (
                <Text style={styles.error}>{errors.surname}</Text>
              )}

              <TextInput
                placeholder="Имя"
                placeholderTextColor="#A4A4A4"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                style={styles.input}
              />
              {touched.name && errors.name && (
                <Text style={styles.error}>{errors.name}</Text>
              )}

              <TextInput
                placeholder="Отчество"
                placeholderTextColor="#A4A4A4"
                onChangeText={handleChange('patronymic')}
                onBlur={handleBlur('patronymic')}
                value={values.patronymic}
                style={styles.input}
              />

              <TextInput
                placeholder="Корпоративная эл. почта"
                placeholderTextColor="#A4A4A4"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={values.programId}
                  onValueChange={handleChange('programId')}
                  style={styles.picker}
                  dropdownIconColor="#A4A4A4"
                  mode="dropdown"
                >
                  <Picker.Item label="Направление" value="" style={styles.pickerFirst}/>
                  {programs.map(p => (
                    <Picker.Item key={p.id} label={p.name} value={p.id.toString()} />
                  ))}
                </Picker>
              </View>
              {touched.programId && errors.programId && (
                <Text style={styles.error}>{errors.programId}</Text>
              )}

              {/* Стилизованный Picker для года поступления */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={values.yearAdmission}
                  onValueChange={handleChange('yearAdmission')}
                  style={styles.picker}
                  dropdownIconColor="#A4A4A4"
                  mode="dropdown"
                >
                  <Picker.Item label="Год поступления" value="" style={styles.pickerFirst}/>
                  {years.map(year => (
                    <Picker.Item key={year} label={year.toString()} value={year.toString()} />
                  ))}
                </Picker>
              </View>
              {touched.yearAdmission && errors.yearAdmission && (
                <Text style={styles.error}>{errors.yearAdmission}</Text>
              )}

              {/* Стилизованный Picker для группы */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={values.group}
                  onValueChange={handleChange('group')}
                  style={styles.picker}
                  dropdownIconColor="#A4A4A4"
                  mode="dropdown"
                >
                  <Picker.Item label="Учебная группа" value="" style={styles.pickerFirst}/>
                  {groups.map(group => (
                    <Picker.Item key={group} label={group.toString()} value={group.toString()} />
                  ))}
                </Picker>
              </View>
              {touched.group && errors.group && (
                <Text style={styles.error}>{errors.group}</Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Зарегистрироваться</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </View></ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFDAEE',
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 56,
    backgroundColor: '#F7F7FD',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerFirst: {
    color: '#A4A4A4'
  },
  pickerWrapper: {
    height: 56,
    backgroundColor: '#F7F7FD',
    borderRadius: 8,
    borderColor: '#E0E0E0',
    fontSize: 16,
    marginBottom: 13,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 56,
    backgroundColor: '#6E5396',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
    paddingLeft: 4,
  },
});