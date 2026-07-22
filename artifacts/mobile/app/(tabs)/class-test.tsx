import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useData, ClassTest, ClassTestResult } from '@/contexts/DataContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUBJECT_COLORS: Record<string, string[]> = {
  Mathematics: ['#3949AB', '#5C6BC0'],
  Science: ['#00838F', '#00BCD4'],
  English: ['#558B2F', '#8BC34A'],
  Hindi: ['#AD1457', '#E91E63'],
  'Social Studies': ['#E65100', '#FF7043'],
};

function getSubjectColors(subject: string): string[] {
  return SUBJECT_COLORS[subject] ?? ['#6A1B9A', '#AB47BC'];
}

function TestCard({ test, isAdmin, onDelete, onPress }: {
  test: ClassTest;
  isAdmin: boolean;
  onDelete: () => void;
  onPress: () => void;
}) {
  const colors = useColors();
  const gradColors = getSubjectColors(test.subject) as [string, string];
  const avg = test.results.length
    ? (test.results.reduce((s, r) => s + r.marks, 0) / test.results.length).toFixed(1)
    : '–';
  return (
    <TouchableOpacity
      style={[styles.testCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient colors={gradColors} style={styles.testGradBar} />
      <View style={styles.testCardContent}>
        <View style={styles.testCardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.testSubject, { color: colors.foreground }]}>{test.subject}</Text>
            <Text style={[styles.testDate, { color: colors.mutedForeground }]}>{test.date}</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.testStatsRow}>
          <View style={[styles.testStat, { backgroundColor: '#E8EAF6' }]}>
            <Text style={styles.testStatLabel}>Max</Text>
            <Text style={styles.testStatValue}>{test.maxMarks}</Text>
          </View>
          <View style={[styles.testStat, { backgroundColor: '#E0F7FA' }]}>
            <Text style={[styles.testStatLabel, { color: '#00838F' }]}>Avg</Text>
            <Text style={[styles.testStatValue, { color: '#00838F' }]}>{avg}</Text>
          </View>
          <View style={[styles.testStat, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.testStatLabel, { color: '#E65100' }]}>Students</Text>
            <Text style={[styles.testStatValue, { color: '#E65100' }]}>{test.results.length}</Text>
          </View>
        </View>
        <View style={[styles.viewDetailRow]}>
          <Text style={{ color: gradColors[0], fontSize: 12, fontFamily: 'Inter_500Medium' }}>
            Tap to view results
          </Text>
          <Ionicons name="chevron-forward" size={14} color={gradColors[0]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ResultsModal({ test, visible, onClose }: { test: ClassTest | null; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  if (!test) return null;
  const gradColors = getSubjectColors(test.subject) as [string, string];
  const sorted = [...test.results].sort((a, b) => a.rollNo - b.rollNo);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.resultsModal, { backgroundColor: '#FFFFFF' }]}>
          <LinearGradient colors={gradColors} style={styles.resultsModalHeader}>
            <View>
              <Text style={styles.resultsModalTitle}>{test.subject}</Text>
              <Text style={styles.resultsModalDate}>{test.date} · Max: {test.maxMarks}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView style={{ flex: 1 }}>
            {sorted.map((r, i) => {
              const pct = Math.round((r.marks / test.maxMarks) * 100);
              const barColor = pct >= 80 ? '#43A047' : pct >= 50 ? '#FB8C00' : '#EF4444';
              return (
                <View key={i} style={styles.resultRow}>
                  <Text style={[styles.resultRoll, { color: colors.mutedForeground }]}>#{r.rollNo}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultName, { color: colors.foreground }]}>{r.name}</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                    </View>
                  </View>
                  <Text style={[styles.resultMarks, { color: barColor }]}>
                    {r.marks}/{test.maxMarks}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function ClassTestScreen() {
  const { user } = useAuth();
  const { classTests, students, addClassTest, deleteClassTest } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  const [selectedTest, setSelectedTest] = useState<ClassTest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [resultsInput, setResultsInput] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  async function handleAdd() {
    if (!subject.trim() || !date.trim() || !maxMarks.trim()) {
      setFormError('Subject, date and max marks are required');
      return;
    }
    const max = parseInt(maxMarks, 10);
    if (isNaN(max) || max <= 0) {
      setFormError('Enter a valid max marks value');
      return;
    }
    const results: ClassTestResult[] = students
      .filter((s) => resultsInput[s.id]?.trim())
      .map((s) => ({
        rollNo: s.rollNo,
        name: s.name,
        marks: Math.min(parseInt(resultsInput[s.id], 10) || 0, max),
      }));
    await addClassTest({ subject: subject.trim(), date: date.trim(), maxMarks: max, results });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddModal(false);
    setSubject(''); setDate(''); setMaxMarks(''); setResultsInput({}); setFormError('');
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Test', 'Delete this test record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClassTest(id); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={classTests}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TestCard
            test={item}
            isAdmin={isAdmin}
            onDelete={() => handleDelete(item.id)}
            onPress={() => setSelectedTest(item)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!classTests.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tests recorded yet</Text>
          </View>
        }
      />

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7043', '#F4511E']} style={styles.fabGrad}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <ResultsModal test={selectedTest} visible={!!selectedTest} onClose={() => setSelectedTest(null)} />

      {/* Add Test Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>New Class Test</Text>
              <TextInput style={styles.modalInput} placeholder="Subject" placeholderTextColor="#9CA3AF" value={subject} onChangeText={setSubject} />
              <TextInput style={styles.modalInput} placeholder="Date (e.g. 2024-01-15)" placeholderTextColor="#9CA3AF" value={date} onChangeText={setDate} />
              <TextInput style={styles.modalInput} placeholder="Max Marks" placeholderTextColor="#9CA3AF" value={maxMarks} onChangeText={setMaxMarks} keyboardType="number-pad" />

              {students.length > 0 && (
                <>
                  <Text style={styles.marksHeader}>Enter Marks (optional)</Text>
                  {students.sort((a, b) => a.rollNo - b.rollNo).map((s) => (
                    <View key={s.id} style={styles.marksRow}>
                      <Text style={styles.marksStudentName}>#{s.rollNo} {s.name}</Text>
                      <TextInput
                        style={styles.marksInput}
                        placeholder="–"
                        placeholderTextColor="#9CA3AF"
                        value={resultsInput[s.id] ?? ''}
                        onChangeText={(v) => setResultsInput((prev) => ({ ...prev, [s.id]: v }))}
                        keyboardType="number-pad"
                      />
                    </View>
                  ))}
                </>
              )}

              {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => { setShowAddModal(false); setFormError(''); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleAdd}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  testCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#3949AB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  testGradBar: { height: 4 },
  testCardContent: { padding: 16 },
  testCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  testSubject: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  testDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  testStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  testStat: { flex: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center' },
  testStatLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#5C6BC0', marginBottom: 1 },
  testStatValue: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#5C6BC0' },
  viewDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'web' ? 120 : 96,
    borderRadius: 30,
    shadowColor: '#FF7043',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGrad: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  // Results Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  resultsModal: { height: '75%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  resultsModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  resultsModalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  resultsModalDate: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F7FF' },
  resultRoll: { fontSize: 13, fontFamily: 'Inter_500Medium', width: 34 },
  resultName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  progressBarBg: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: 4, borderRadius: 2 },
  resultMarks: { fontSize: 14, fontFamily: 'Inter_700Bold', minWidth: 50, textAlign: 'right' },
  // Add Modal
  addModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A237E', marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E7FF', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1A237E', marginBottom: 12 },
  marksHeader: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#5C6BC0', marginBottom: 10, marginTop: 4 },
  marksRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  marksStudentName: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', color: '#1A237E' },
  marksInput: { width: 70, backgroundColor: '#F5F7FF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1A237E', textAlign: 'center' },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnSave: { backgroundColor: '#5C6BC0' },
  saveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
