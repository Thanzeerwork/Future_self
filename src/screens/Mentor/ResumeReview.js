import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Chip,
  Text,
  FAB,
} from 'react-native-paper';
import { colors } from '../../constants/colors';
import { firestore } from '../../../firebase.config';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const ResumeReview = ({ navigation, route }) => {
  const { studentId } = route.params || {};
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      let query = firestore().collection('resumes');
      
      if (studentId) {
        query = query.where('userId', '==', studentId);
      }
      
      const resumesSnapshot = await query.get();
      const resumesData = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setResumes(resumesData);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResumes();
    setRefreshing(false);
  };

  const selectResume = (resume) => {
    setSelectedResume(resume);
    setFeedback('');
    setRating(0);
  };

  const submitFeedback = async () => {
    if (!selectedResume || !feedback.trim()) {
      return;
    }

    try {
      await firestore().collection('resumeReviews').add({
        resumeId: selectedResume.id,
        mentorId: 'current-mentor-id', // In real app, get from auth context
        feedback: feedback,
        rating: rating,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      });

      // Update resume with review status
      await firestore()
        .collection('resumes')
        .doc(selectedResume.id)
        .update({
          reviewed: true,
          lastReviewed: firestore.FieldValue.serverTimestamp(),
        });

      setSelectedResume(null);
      setFeedback('');
      setRating(0);
      
      // Refresh the list
      await loadResumes();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return colors.success;
    if (rating >= 3) return colors.warning;
    return colors.error;
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resume List */}
        <Card style={styles.resumesCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Resumes to Review</Title>
            {resumes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No resumes available for review</Text>
              </View>
            ) : (
              resumes.map((resume) => (
                <Card
                  key={resume.id}
                  style={[
                    styles.resumeCard,
                    selectedResume?.id === resume.id && styles.selectedResume
                  ]}
                  onPress={() => selectResume(resume)}
                >
                  <Card.Content>
                    <View style={styles.resumeHeader}>
                      <Text style={styles.resumeName}>
                        {resume.personalInfo?.fullName || 'Unnamed Resume'}
                      </Text>
                      <Chip
                        mode="outlined"
                        style={[
                          styles.statusChip,
                          { backgroundColor: resume.reviewed ? colors.success : colors.warning }
                        ]}
                        textStyle={{ color: colors.white }}
                      >
                        {resume.reviewed ? 'Reviewed' : 'Pending'}
                      </Chip>
                    </View>
                    <Text style={styles.resumeEmail}>
                      {resume.personalInfo?.email || 'No email'}
                    </Text>
                    <Text style={styles.resumeDate}>
                      Updated: {resume.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </Text>
                    {resume.summary && (
                      <Paragraph style={styles.resumeSummary} numberOfLines={2}>
                        {resume.summary}
                      </Paragraph>
                    )}
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Review Form */}
        {selectedResume && (
          <Card style={styles.reviewCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>
                Review: {selectedResume.personalInfo?.fullName}
              </Title>
              
              {/* Rating */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Overall Rating:</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      mode={rating >= star ? 'contained' : 'outlined'}
                      onPress={() => setRating(star)}
                      style={[
                        styles.ratingButton,
                        { backgroundColor: rating >= star ? colors.primary : colors.white }
                      ]}
                      icon="star"
                    >
                      {star}
                    </Button>
                  ))}
                </View>
                {rating > 0 && (
                  <Text style={[styles.ratingText, { color: getRatingColor(rating) }]}>
                    {getRatingLabel(rating)}
                  </Text>
                )}
              </View>

              {/* Feedback */}
              <TextInput
                label="Feedback"
                value={feedback}
                onChangeText={setFeedback}
                mode="outlined"
                multiline
                numberOfLines={6}
                placeholder="Provide detailed feedback on the resume..."
                style={styles.feedbackInput}
              />

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedResume(null);
                    setFeedback('');
                    setRating(0);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitFeedback}
                  disabled={!feedback.trim() || rating === 0}
                  style={styles.submitButton}
                >
                  Submit Feedback
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Review Guidelines */}
        <Card style={styles.guidelinesCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Review Guidelines</Title>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineText}>
                • Check for ATS compatibility and formatting
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineText}>
                • Verify contact information and professional details
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineText}>
                • Review education and experience sections
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineText}>
                • Assess skills and achievements relevance
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineText}>
                • Provide constructive feedback for improvement
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={loadResumes}
      />
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
  resumesCard: {
    margin: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  resumeCard: {
    marginBottom: 12,
    elevation: 2,
  },
  selectedResume: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  resumeEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resumeDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resumeSummary: {
    fontSize: 14,
    color: colors.text,
  },
  reviewCard: {
    margin: 16,
    marginVertical: 8,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackInput: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  guidelinesCard: {
    margin: 16,
    marginVertical: 8,
  },
  guidelineItem: {
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default ResumeReview;
