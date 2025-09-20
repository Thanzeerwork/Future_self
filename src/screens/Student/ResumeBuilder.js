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
  Modal,
  Portal,
  Surface,
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
    template: 'professional', // Default template
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Resume templates
  const templates = {
    professional: {
      name: 'Professional',
      description: 'Clean and traditional design',
      color: '#2196F3',
      preview: 'Blue header with clean sections'
    },
    modern: {
      name: 'Modern',
      description: 'Contemporary with bold accents',
      color: '#FF5722',
      preview: 'Orange accents with modern typography'
    },
    creative: {
      name: 'Creative',
      description: 'Eye-catching design for creative fields',
      color: '#9C27B0',
      preview: 'Purple theme with creative layout'
    },
    minimalist: {
      name: 'Minimalist',
      description: 'Simple and elegant design',
      color: '#424242',
      preview: 'Black and white with minimal styling'
    }
  };

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

  const selectTemplate = (templateKey) => {
    setResume(prev => ({ ...prev, template: templateKey }));
    setShowTemplateSelector(false);
  };

  const showTemplatePreview = (templateKey) => {
    setPreviewTemplate(templateKey);
  };

  const generatePreviewHTML = (templateKey) => {
    const template = templates[templateKey];
    const primaryColor = template.color;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume Preview</title>
          <style>
            body { 
              font-family: ${templateKey === 'modern' ? 'Helvetica, Arial, sans-serif' : 'Arial, sans-serif'}; 
              margin: 15px; 
              line-height: 1.5; 
              font-size: 12px;
              ${templateKey === 'minimalist' ? 'color: #333;' : ''}
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              ${templateKey === 'creative' ? 'background: linear-gradient(135deg, ${primaryColor}, #E1BEE7); padding: 15px; border-radius: 8px; color: white;' : ''}
            }
            .name { 
              font-size: ${templateKey === 'modern' ? '24px' : '20px'}; 
              font-weight: bold; 
              color: ${templateKey === 'creative' ? 'white' : primaryColor}; 
              ${templateKey === 'modern' ? 'text-transform: uppercase; letter-spacing: 1px;' : ''}
            }
            .contact { 
              margin-top: 8px; 
              font-size: 10px;
              ${templateKey === 'creative' ? 'color: white;' : ''}
              ${templateKey === 'minimalist' ? 'color: #666;' : ''}
            }
            .section { 
              margin-bottom: 15px; 
              ${templateKey === 'creative' ? 'background: #f8f9fa; padding: 10px; border-radius: 6px;' : ''}
            }
            .section-title { 
              font-size: 14px; 
              font-weight: bold; 
              color: #333; 
              border-bottom: 2px solid ${primaryColor}; 
              padding-bottom: 3px; 
              ${templateKey === 'modern' ? 'text-transform: uppercase; letter-spacing: 1px;' : ''}
              ${templateKey === 'minimalist' ? 'border-bottom: 1px solid #ddd; color: #666;' : ''}
            }
            .item { 
              margin-bottom: 8px; 
              ${templateKey === 'creative' ? 'padding: 6px; background: white; border-radius: 4px;' : ''}
            }
            .item-title { 
              font-weight: bold; 
              font-size: 11px;
              ${templateKey === 'modern' ? 'color: ' + primaryColor + ';' : ''}
            }
            .item-date { 
              color: #666; 
              font-style: italic; 
              font-size: 9px;
            }
            .skills { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 3px; 
            }
            .skill { 
              background: ${templateKey === 'minimalist' ? '#f5f5f5' : '#f0f0f0'}; 
              padding: 2px 6px; 
              border-radius: 2px; 
              font-size: 9px; 
              ${templateKey === 'creative' ? 'background: ' + primaryColor + '; color: white;' : ''}
              ${templateKey === 'modern' ? 'border: 1px solid ' + primaryColor + '; color: ' + primaryColor + ';' : ''}
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">John Doe</div>
            <div class="contact">
              john.doe@email.com | (555) 123-4567 | New York, NY
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Summary</div>
            <p>Experienced software developer with 5+ years in full-stack development.</p>
          </div>
          
          <div class="section">
            <div class="section-title">Education</div>
            <div class="item">
              <div class="item-title">Bachelor of Science in Computer Science - University of Technology</div>
              <div class="item-date">2018 - 2022</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Experience</div>
            <div class="item">
              <div class="item-title">Software Developer - Tech Company</div>
              <div class="item-date">2022 - Present</div>
              <div>Developed web applications using React and Node.js</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              <span class="skill">JavaScript</span>
              <span class="skill">React</span>
              <span class="skill">Node.js</span>
              <span class="skill">Python</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generateResumeHTML = (resumeData) => {
    const template = templates[resumeData.template] || templates.professional;
    const primaryColor = template.color;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resume - ${resumeData.personalInfo.fullName}</title>
          <style>
            body { 
              font-family: ${resumeData.template === 'modern' ? 'Helvetica, Arial, sans-serif' : 'Arial, sans-serif'}; 
              margin: 20px; 
              line-height: 1.6; 
              ${resumeData.template === 'minimalist' ? 'color: #333;' : ''}
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              ${resumeData.template === 'creative' ? 'background: linear-gradient(135deg, ${primaryColor}, #E1BEE7); padding: 20px; border-radius: 10px; color: white;' : ''}
            }
            .name { 
              font-size: ${resumeData.template === 'modern' ? '32px' : '28px'}; 
              font-weight: bold; 
              color: ${resumeData.template === 'creative' ? 'white' : primaryColor}; 
              ${resumeData.template === 'modern' ? 'text-transform: uppercase; letter-spacing: 2px;' : ''}
            }
            .contact { 
              margin-top: 10px; 
              ${resumeData.template === 'creative' ? 'color: white;' : ''}
              ${resumeData.template === 'minimalist' ? 'font-size: 14px; color: #666;' : ''}
            }
            .section { 
              margin-bottom: 25px; 
              ${resumeData.template === 'creative' ? 'background: #f8f9fa; padding: 15px; border-radius: 8px;' : ''}
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #333; 
              border-bottom: 2px solid ${primaryColor}; 
              padding-bottom: 5px; 
              ${resumeData.template === 'modern' ? 'text-transform: uppercase; letter-spacing: 1px;' : ''}
              ${resumeData.template === 'minimalist' ? 'border-bottom: 1px solid #ddd; color: #666;' : ''}
            }
            .item { 
              margin-bottom: 15px; 
              ${resumeData.template === 'creative' ? 'padding: 10px; background: white; border-radius: 5px;' : ''}
            }
            .item-title { 
              font-weight: bold; 
              ${resumeData.template === 'modern' ? 'color: ' + primaryColor + ';' : ''}
            }
            .item-date { 
              color: #666; 
              font-style: italic; 
              ${resumeData.template === 'minimalist' ? 'font-size: 12px;' : ''}
            }
            .skills { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 5px; 
            }
            .skill { 
              background: ${resumeData.template === 'minimalist' ? '#f5f5f5' : '#f0f0f0'}; 
              padding: 3px 8px; 
              border-radius: 3px; 
              font-size: 12px; 
              ${resumeData.template === 'creative' ? 'background: ' + primaryColor + '; color: white;' : ''}
              ${resumeData.template === 'modern' ? 'border: 1px solid ' + primaryColor + '; color: ' + primaryColor + ';' : ''}
            }
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

        {/* Template Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.cardTitle}>Resume Template</Title>
              <Button 
                mode="outlined" 
                onPress={() => setShowTemplateSelector(true)}
                compact
              >
                Change Template
              </Button>
            </View>
            <View style={styles.currentTemplate}>
              <View style={[styles.templateColor, { backgroundColor: templates[resume.template]?.color }]} />
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{templates[resume.template]?.name}</Text>
                <Text style={styles.templateDescription}>{templates[resume.template]?.description}</Text>
              </View>
            </View>
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

      {/* Template Selector Modal */}
      <Portal>
        <Modal
          visible={showTemplateSelector}
          onDismiss={() => setShowTemplateSelector(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Choose Resume Template</Title>
              <View style={styles.templatesGrid}>
                {Object.entries(templates).map(([key, template]) => (
                  <Card
                    key={key}
                    style={[
                      styles.templateCard,
                      resume.template === key && styles.selectedTemplate
                    ]}
                  >
                    <Card.Content style={styles.templateCardContent}>
                      <View style={[styles.templatePreview, { backgroundColor: template.color }]} />
                      <Text style={styles.templateCardName}>{template.name}</Text>
                      <Text style={styles.templateCardDescription}>{template.description}</Text>
                      <View style={styles.templateActions}>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => showTemplatePreview(key)}
                          style={styles.previewButton}
                        >
                          Preview
                        </Button>
                        <Button
                          mode="contained"
                          compact
                          onPress={() => selectTemplate(key)}
                          style={styles.selectButton}
                        >
                          Select
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
              <Button
                mode="outlined"
                onPress={() => setShowTemplateSelector(false)}
                style={styles.modalCloseButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Template Preview Modal */}
      <Portal>
        <Modal
          visible={previewTemplate !== null}
          onDismiss={() => setPreviewTemplate(null)}
          contentContainerStyle={styles.previewModalContainer}
        >
          <Card style={styles.previewModalCard}>
            <Card.Content>
              <Title style={styles.previewModalTitle}>
                {templates[previewTemplate]?.name} Template Preview
              </Title>
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>
                  This is how your resume will look with the {templates[previewTemplate]?.name.toLowerCase()} template.
                  The actual resume will use your personal information and content.
                </Text>
              </View>
              <View style={styles.previewActions}>
                <Button
                  mode="outlined"
                  onPress={() => setPreviewTemplate(null)}
                  style={styles.previewCloseButton}
                >
                  Close Preview
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    selectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  style={styles.previewSelectButton}
                >
                  Use This Template
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
  // Template selector styles
  currentTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  templateColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  templateCard: {
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: colors.primary,
  },
  templateCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  previewButton: {
    flex: 1,
    marginRight: 4,
  },
  selectButton: {
    flex: 1,
    marginLeft: 4,
  },
  templatePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  templateCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: colors.text,
  },
  templateCardDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  // Preview modal styles
  previewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  previewModalCard: {
    maxHeight: '70%',
  },
  previewModalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  previewContainer: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewCloseButton: {
    flex: 1,
    marginRight: 8,
  },
  previewSelectButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ResumeBuilder;
