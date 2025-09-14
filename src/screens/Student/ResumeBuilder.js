import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Text,
  Divider,
  Chip,
  FAB,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { firestore, storage } from '../../../firebase.config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ResumeBuilder = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [resume, setResume] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      const resumeDoc = await getDoc(resumeDocRef);
      
      if (resumeDoc.exists()) {
        setResume(resumeDoc.data());
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    }
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      await setDoc(resumeDocRef, {
        ...resume,
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Resume saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const html = generateResumeHTML(resume);
      const { uri } = await Print.printToFileAsync({ html });
      
      // Upload to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `resumes/${userProfile?.uid}/resume.pdf`);
      await uploadBytes(storageRef, blob);
      
      // Save download URL to Firestore
      const downloadURL = await getDownloadURL(storageRef);
      const resumeDocRef = doc(firestore, 'resumes', userProfile?.uid);
      await updateDoc(resumeDocRef, { pdfUrl: downloadURL });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const generateResumeHTML = (resumeData) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .name { font-size: 28px; font-weight: bold; color: #2196F3; }
            .contact { margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 5px; }
            .item { margin-bottom: 15px; }
            .item-title { font-weight: bold; }
            .item-date { color: #666; font-style: italic; }
            .skills { display: flex; flex-wrap: wrap; gap: 5px; }
            .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${resumeData.personalInfo.fullName}</div>
            <div class="contact">
              ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
            </div>
          </div>
          
          ${resumeData.summary ? `
          <div class="section">
            <div class="section-title">Summary</div>
            <p>${resumeData.summary}</p>
          </div>
          ` : ''}
          
          ${resumeData.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${resumeData.education.map(edu => `
              <div class="item">
                <div class="item-title">${edu.degree} - ${edu.institution}</div>
                <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
                ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${resumeData.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${resumeData.experience.map(exp => `
              <div class="item">
                <div class="item-title">${exp.title} - ${exp.company}</div>
                <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
                <div>${exp.description}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${resumeData.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </body>
      </html>
    `;
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: '',
      }]
    }));
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      }]
    }));
  };

  const addSkill = () => {
    setResume(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Personal Information</Title>
            <TextInput
              label="Full Name"
              value={resume.personalInfo.fullName}
              onChangeText={(text) => setResume(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, fullName: text }
              }))}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={resume.personalInfo.email}
              onChangeText={(text) => setResume(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, email: text }
              }))}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={resume.personalInfo.phone}
              onChangeText={(text) => setResume(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, phone: text }
              }))}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Location"
              value={resume.personalInfo.location}
              onChangeText={(text) => setResume(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, location: text }
              }))}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Professional Summary</Title>
            <TextInput
              label="Summary"
              value={resume.summary}
              onChangeText={(text) => setResume(prev => ({ ...prev, summary: text }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Education */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.cardTitle}>Education</Title>
              <Button mode="outlined" onPress={addEducation} compact>
                Add
              </Button>
            </View>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <TextInput
                  label="Degree"
                  value={edu.degree}
                  onChangeText={(text) => {
                    const newEducation = [...resume.education];
                    newEducation[index].degree = text;
                    setResume(prev => ({ ...prev, education: newEducation }));
                  }}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Institution"
                  value={edu.institution}
                  onChangeText={(text) => {
                    const newEducation = [...resume.education];
                    newEducation[index].institution = text;
                    setResume(prev => ({ ...prev, education: newEducation }));
                  }}
                  mode="outlined"
                  style={styles.input}
                />
                <View style={styles.dateRow}>
                  <TextInput
                    label="Start Date"
                    value={edu.startDate}
                    onChangeText={(text) => {
                      const newEducation = [...resume.education];
                      newEducation[index].startDate = text;
                      setResume(prev => ({ ...prev, education: newEducation }));
                    }}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                  />
                  <TextInput
                    label="End Date"
                    value={edu.endDate}
                    onChangeText={(text) => {
                      const newEducation = [...resume.education];
                      newEducation[index].endDate = text;
                      setResume(prev => ({ ...prev, education: newEducation }));
                    }}
                    mode="outlined"
                    style={[styles.input, styles.halfInput]}
                  />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Skills */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.cardTitle}>Skills</Title>
              <Button mode="outlined" onPress={addSkill} compact>
                Add
              </Button>
            </View>
            <View style={styles.skillsContainer}>
              {resume.skills.map((skill, index) => (
                <Chip
                  key={index}
                  onClose={() => {
                    const newSkills = resume.skills.filter((_, i) => i !== index);
                    setResume(prev => ({ ...prev, skills: newSkills }));
                  }}
                  style={styles.skillChip}
                >
                  <TextInput
                    value={skill}
                    onChangeText={(text) => {
                      const newSkills = [...resume.skills];
                      newSkills[index] = text;
                      setResume(prev => ({ ...prev, skills: newSkills }));
                    }}
                    style={styles.skillInput}
                    placeholder="Enter skill"
                  />
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={saveResume}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Save Resume
        </Button>
        <FAB
          style={styles.fab}
          icon="file-pdf-box"
          onPress={generatePDF}
          loading={loading}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  educationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  skillInput: {
    minWidth: 100,
  },
  fabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    elevation: 8,
  },
  saveButton: {
    flex: 1,
    marginRight: 16,
  },
  fab: {
    backgroundColor: colors.primary,
  },
});

export default ResumeBuilder;
