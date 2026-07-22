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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Student } from '@/contexts/DataContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function StudentCard({ student, isAdmin, onDelete }: { student: Student; isAdmin: boolean; onDelete: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.studentCard, { backgroundColor: colors.card }]}>
      <LinearGradient colors={['#5C6BC0', '#7E57C2']} style={styles.rollBadge}>
        <Text style={styles.rollText}>{student.rollNo}</Text>
      </LinearGradient>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: colors.foreground }]}>{student.name}</Text>
        <Text style={[styles.studentDetail, { color: colors.mutedForeground }]}>
          Father: {student.fatherName}
        </Text>
        <Text style={[styles.studentDetail, { color: colors.mutedForeground }]}>
          Contact: {student.contact}
        </Text>
      </View>
      {isAdmin && (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function NominalRollScreen() {
  const { user } = useAuth();
  const { students, addStudent, deleteStudent } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [contact, setContact] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [formError, setFormError] = useState('');

  const filtered = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        String(s.rollNo).includes(search)
    )
    .sort((a, b) => a.rollNo - b.rollNo);

  async function handleAdd() {
    if (!name.trim() || !fatherName.trim() || !rollNo.trim()) {
      setFormError('Name, Father\'s Name and Roll No. are required');
      return;
    }
    const roll = parseInt(rollNo, 10);
    if (isNaN(roll) || roll <= 0) {
      setFormError('Enter a valid roll number');
      return;
    }
    if (students.find((s) => s.rollNo === roll)) {
      setFormError('Roll number already exists');
      return;
    }
    await addStudent({
      rollNo: roll,
      name: name.trim(),
      fatherName: fatherName.trim(),
      contact: contact.trim() || 'N/A',
      section: 'H',
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setName(''); setFatherName(''); setContact(''); setRollNo(''); setFormError('');
  }

  async function handleDelete(id: string) {
    Alert.alert('Remove Student', 'Remove this student from nominal roll?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteStudent(id);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }

  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or roll no."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Header Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
        <View style={[styles.statChip, { backgroundColor: '#E8EAF6' }]}>
          <Ionicons name="people" size={14} color="#5C6BC0" />
          <Text style={styles.statText}>{students.length} Students</Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: '#E0F7FA' }]}>
          <Ionicons name="school" size={14} color="#00838F" />
          <Text style={[styles.statText, { color: '#00838F' }]}>Section H</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <StudentCard
            student={item}
            isAdmin={isAdmin}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search ? 'No students found' : 'No students added yet'}
            </Text>
          </View>
        }
      />

      {/* Admin FAB */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowModal(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#FF7043', '#F4511E']} style={styles.fabGrad}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Student Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Roll Number"
              placeholderTextColor="#9CA3AF"
              value={rollNo}
              onChangeText={setRollNo}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Student Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Father's Name"
              placeholderTextColor="#9CA3AF"
              value={fatherName}
              onChangeText={setFatherName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Number (optional)"
              placeholderTextColor="#9CA3AF"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />
            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => { setShowModal(false); setFormError(''); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleAdd}
              >
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#5C6BC0' },
  listContent: { paddingHorizontal: 16 },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#3949AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  rollBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rollText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  studentDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
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
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A237E', marginBottom: 20 },
  modalInput: {
    backgroundColor: '#F5F7FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A237E',
    marginBottom: 12,
  },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnSave: { backgroundColor: '#5C6BC0' },
  saveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
