import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  Divider, 
  Avatar,
  Portal,
  Modal,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Profile form data
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    registrationNo: '',
    gender: '',
    dateOfBirth: '',
    aadharNumber: '',
    religion: '',
    caste: '',
    profileImageUrl: ''
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (userProfile) {
      setFormData({
        studentName: userProfile.studentName || '',
        rollNo: userProfile.rollNo || '',
        registrationNo: userProfile.registrationNo || '',
        gender: userProfile.gender || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        aadharNumber: userProfile.aadharNumber || '',
        religion: userProfile.religion || '',
        caste: userProfile.caste || '',
        profileImageUrl: userProfile.profileImageUrl || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        studentName: userProfile.studentName || '',
        rollNo: userProfile.rollNo || '',
        registrationNo: userProfile.registrationNo || '',
        gender: userProfile.gender || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        aadharNumber: userProfile.aadharNumber || '',
        religion: userProfile.religion || '',
        caste: userProfile.caste || '',
        profileImageUrl: userProfile.profileImageUrl || ''
      });
    }
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          profileImageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          profileImageUrl: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePickerModal = () => {
    setShowImagePicker(true);
  };

  const hideImagePickerModal = () => {
    setShowImagePicker(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
      </View>

      {/* Profile Image Section */}
      <Card style={styles.card}>
        <Card.Content style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {formData.profileImageUrl ? (
              <Avatar.Image 
                size={120} 
                source={{ uri: formData.profileImageUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <Avatar.Text 
                size={120} 
                label={formData.studentName ? formData.studentName.charAt(0).toUpperCase() : 'U'} 
                style={styles.profileImage}
              />
            )}
            {isEditing && (
              <Button 
                mode="contained" 
                onPress={showImagePickerModal}
                style={styles.imageButton}
                compact
              >
                Change Photo
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Personal Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Personal Information
          </Text>
          
          <TextInput
            label="Student Name"
            value={formData.studentName}
            onChangeText={(text) => handleInputChange('studentName', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
          />
          
          <TextInput
            label="Roll Number"
            value={formData.rollNo}
            onChangeText={(text) => handleInputChange('rollNo', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
          />
          
          <TextInput
            label="Registration Number"
            value={formData.registrationNo}
            onChangeText={(text) => handleInputChange('registrationNo', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
          />
          
          <TextInput
            label="Gender"
            value={formData.gender}
            onChangeText={(text) => handleInputChange('gender', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
            placeholder="Male/Female/Other"
          />
          
          <TextInput
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(text) => handleInputChange('dateOfBirth', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
            placeholder="DD/MM/YYYY"
          />
        </Card.Content>
      </Card>

      {/* Identity Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Identity Information
          </Text>
          
          <TextInput
            label="Aadhar Number"
            value={formData.aadharNumber}
            onChangeText={(text) => handleInputChange('aadharNumber', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
            keyboardType="numeric"
            maxLength={12}
          />
          
          <TextInput
            label="Religion"
            value={formData.religion}
            onChangeText={(text) => handleInputChange('religion', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
          />
          
          <TextInput
            label="Caste"
            value={formData.caste}
            onChangeText={(text) => handleInputChange('caste', text)}
            mode="outlined"
            style={styles.input}
            editable={isEditing}
          />
        </Card.Content>
      </Card>

      {/* Account Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Email:</Text>
            <Text variant="bodyMedium" style={styles.value}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Role:</Text>
            <Text variant="bodyMedium" style={styles.value}>{userProfile?.role}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>User ID:</Text>
            <Text variant="bodyMedium" style={styles.value}>{user?.uid}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Card style={styles.card}>
        <Card.Content>
          {!isEditing ? (
            <Button 
              mode="contained" 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          ) : (
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={handleCancelEdit}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveProfile}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Image Picker Modal */}
      <Portal>
        <Modal 
          visible={showImagePicker} 
          onDismiss={hideImagePickerModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text variant="titleMedium" style={styles.modalTitle}>
                Select Profile Image
              </Text>
              
              <Button 
                mode="contained" 
                onPress={takePhoto}
                style={styles.modalButton}
                icon="camera"
              >
                Take Photo
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={pickImage}
                style={styles.modalButton}
                icon="image"
              >
                Choose from Gallery
              </Button>
              
              <Button 
                mode="text" 
                onPress={hideImagePickerModal}
                style={styles.modalButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    marginBottom: 10,
  },
  imageButton: {
    marginTop: 10,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    color: colors.textPrimary,
  },
  editButton: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  modalContainer: {
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  modalButton: {
    marginBottom: 10,
  },
});

export default Profile;

