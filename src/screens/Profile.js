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
  ActivityIndicator,
  ProgressBar
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import ImageUploadService from '../services/imageUploadService';

const Profile = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      hideImagePickerModal();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        // Validate image
        const isValid = await ImageUploadService.validateImage(imageUri);
        if (!isValid) {
          Alert.alert('Invalid Image', 'Please select a valid image file (JPG, PNG, GIF, WebP) under 10MB');
          return;
        }

        setProfileImage(imageUri);
        await uploadProfileImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const takePhoto = async () => {
    try {
      hideImagePickerModal();
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        
        // Validate image
        const isValid = await ImageUploadService.validateImage(imageUri);
        if (!isValid) {
          Alert.alert('Invalid Image', 'Please take a valid photo');
          return;
        }

        setProfileImage(imageUri);
        await uploadProfileImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const showImagePickerModal = () => {
    setShowImagePicker(true);
  };

  const hideImagePickerModal = () => {
    setShowImagePicker(false);
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      setUploadProgress(0);
      
      // Delete old image if exists
      if (formData.profileImageUrl && formData.profileImageUrl.startsWith('https://')) {
        await ImageUploadService.deleteImage(formData.profileImageUrl);
      }

      // Upload new image
      const downloadURL = await ImageUploadService.uploadImage(
        imageUri,
        user.uid,
        'profile',
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        profileImageUrl: downloadURL
      }));

      // Update profile in database
      await updateProfile({ profileImageUrl: downloadURL });
      
      Alert.alert('Success', 'Profile image updated successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      hideImagePickerModal();
    }
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
                style={[styles.profileImage, styles.defaultAvatar]}
              />
            )}
            
            {/* Upload Progress */}
            {uploadingImage && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.uploadProgressText}>
                  Uploading... {Math.round(uploadProgress)}%
                </Text>
                <ProgressBar 
                  progress={uploadProgress / 100} 
                  color={colors.primary}
                  style={styles.uploadProgressBar}
                />
              </View>
            )}
            
            {isEditing && !uploadingImage && (
              <Button 
                mode="contained" 
                onPress={showImagePickerModal}
                style={styles.imageButton}
                compact
                disabled={uploadingImage}
              >
                {formData.profileImageUrl ? 'Change Photo' : 'Add Photo'}
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

        {/* Fullscreen loader while uploading */}
        <Modal
          visible={uploadingImage}
          dismissable={false}
          contentContainerStyle={styles.loadingOverlay}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Uploading photo… {Math.round(uploadProgress)}%
          </Text>
          <ProgressBar
            progress={uploadProgress / 100}
            color={colors.primary}
            style={styles.loadingBar}
          />
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
  defaultAvatar: {
    backgroundColor: colors.primary,
  },
  imageButton: {
    marginTop: 10,
  },
  uploadProgressContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  uploadProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    marginBottom: 5,
  },
  uploadProgressBar: {
    width: '80%',
    height: 4,
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
  loadingOverlay: {
    backgroundColor: colors.cardBackground || '#fff',
    padding: 24,
    marginHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textPrimary,
  },
  loadingBar: {
    width: '100%',
    marginTop: 12,
  },
});

export default Profile;


