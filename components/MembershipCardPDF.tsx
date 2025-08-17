import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  thankYou: {
    textAlign: 'center',
    marginBottom: 30,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
  },
  thankYouSubtitle: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  membershipCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 15,
    padding: 25,
    margin: '20 0',
    color: '#ffffff',
  },
  premiumCard: {
    backgroundColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: '6 12',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberInfo: {
    marginBottom: 15,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  memberId: {
    fontSize: 14,
    fontFamily: 'Courier',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    padding: '6 10',
    marginBottom: 6,
    width: 'fit-content',
  },
  memberDetails: {
    fontSize: 11,
    lineHeight: 1.4,
    opacity: 0.9,
  },
  benefits: {
    marginTop: 25,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 12,
  },
  benefitItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeft: '3 solid #6366f1',
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  benefitDescription: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.3,
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #e5e7eb',
    color: '#6b7280',
    fontSize: 10,
    lineHeight: 1.4,
  },
});

interface MembershipCardPDFProps {
  name: string;
  memberId: string;
  membershipType: 'free' | 'premium';
  joinDate: string;
  email: string;
}

export const MembershipCardPDF: React.FC<MembershipCardPDFProps> = ({
  name,
  memberId,
  membershipType,
  joinDate,
  email,
}) => {
  const isPremium = membershipType === 'premium';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚀 Codeunia</Text>
          <Text style={styles.tagline}>Empowering the Next Generation of Coders</Text>
        </View>

        {/* Thank You Section */}
        <View style={styles.thankYou}>
          <Text style={styles.thankYouTitle}>THANK YOU</Text>
          <Text style={styles.thankYouSubtitle}>FOR BEING A VALUED MEMBER</Text>
          <Text style={styles.thankYouText}>
            You are now an official Codeunia Member! Welcome to our global, student-led tech community focused on real-world collaboration, innovation, and learning.
          </Text>
        </View>

        {/* Membership Card */}
        <View style={isPremium ? [styles.membershipCard, styles.premiumCard] : styles.membershipCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CODEUNIA</Text>
            <Text style={styles.memberType}>
              {isPremium ? '👑 PREMIUM' : '🌟 STUDENT'} MEMBER
            </Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{name}</Text>
            <Text style={styles.memberId}>Member ID: {memberId}</Text>
            <Text style={styles.memberDetails}>
              📧 {email}{'\n'}
              📅 Member since: {new Date(joinDate).toLocaleDateString()}{'\n'}
              ⭐ Status: Active Member
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>
            🎯 Your {isPremium ? 'Premium ' : ''}Membership Benefits
          </Text>

          {isPremium ? (
            <>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Golden Username & ID</Text>
                <Text style={styles.benefitDescription}>
                  Stand out with premium branding and exclusive visual indicators
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>3x Points Multiplier</Text>
                <Text style={styles.benefitDescription}>
                  Accelerate your leaderboard progress with triple point rewards
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Free Event Access</Text>
                <Text style={styles.benefitDescription}>
                  Join all paid events, workshops, and bootcamps at no additional cost
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Priority Support</Text>
                <Text style={styles.benefitDescription}>
                  Get help, mentorship, and guidance with priority access
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Community Access</Text>
                <Text style={styles.benefitDescription}>
                  Join discussions, collaborate on projects, and network globally
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Free Events</Text>
                <Text style={styles.benefitDescription}>
                  Participate in community events, workshops, and learning sessions
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Learning Resources</Text>
                <Text style={styles.benefitDescription}>
                  Access to tutorials, guides, and educational content
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitTitle}>Profile Customization</Text>
                <Text style={styles.benefitDescription}>
                  Personalize your member profile and showcase your skills
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This digital card serves as proof of your active membership and access to exclusive benefits.
          </Text>
          <Text style={{ marginTop: 5 }}>
            © {new Date().getFullYear()} Codeunia. All rights reserved.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Questions? Contact us at connect@codeunia.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};
