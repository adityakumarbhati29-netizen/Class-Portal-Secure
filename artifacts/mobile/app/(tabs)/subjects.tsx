import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Subject } from '@/contexts/DataContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '@/components/ConfirmModal';

const SUBJECT_ICONS: Record<string, { name: any; color: string; bg: string; grad: string[] }> = {
  Mathematics: { name: 'calculator-variant', color: '#3949AB', bg: '#E8EAF6', grad: ['#3949AB', '#5C6BC0'] },
  Science: { name: 'flask', color: '#00838F', bg: '#E0F7FA', grad: ['#00838F', '#00BCD4'] },
  English: { name: 'book-open-variant', color: '#2E7D32', bg: '#E8F5E9', grad: ['#2E7D32', '#43A047'] },
  Hindi: { name: 'script-text', color: '#AD1457', bg: '#FCE4EC', grad: ['#AD1457', '#E91E63'] },
  'Social Studies': { name: 'earth', color: '#E65100', bg: '#FBE9E7', grad: ['#E65100', '#FF7043'] },
};

function getSubjectMeta(name: string) {
  return SUBJECT_ICONS[name] ?? { name: 'book', color: '#6A1B9A', bg: '#F3E5F5', grad: ['#6A1B9A', '#AB47BC'] };
}

export default function SubjectsScreen() {
  const { user } = useAuth();
  const { subjects, addSubject, deleteSubject, addTopicToSubject, deleteTopicFromSubject } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [confirmDeleteSubjectId, setConfirmDeleteSubjectId] = useState<string | null>(null);
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState<{ subjectId: string; topicId: string } | null>(null);

  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacher, setSubjectTeacher] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [formError, setFormError] = useState('');

  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  // Sync selectedSubject with data updates
  const liveSelected = selectedSubject
    ? subjects.find((s) => s.id === selectedSubject.id) ?? null
    : null;

  async function handleAddSubject() {
    if (!subjectName.trim() || !subjectTeacher.trim()) {
      setFormError('Both fields are required');
      return;
    }
    await addSubject({ name: subjectName.trim(), teacher: subjectTeacher.trim(), topics: [] });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddSubject(false);
    setSubjectName(''); setSubjectTeacher(''); setFormError('');
  }

  async function handleAddTopic() {
    if (!topicTitle.trim()) { setFormError('Topic title is required'); return; }
    if (!liveSelected) return;
    await addTopicToSubject(liveSelected.id, { title: topicTitle.trim(), description: topicDesc.trim() });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddTopic(false);
    setTopicTitle(''); setTopicDesc(''); setFormError('');
  }

  async function confirmDeleteSubject() {
    if (!confirmDeleteSubjectId) return;
    await deleteSubject(confirmDeleteSubjectId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmDeleteSubjectId(null);
  }

  async function confirmDeleteTopicFn() {
    if (!confirmDeleteTopic) return;
    await deleteTopicFromSubject(confirmDeleteTopic.subjectId, confirmDeleteTopic.topicId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmDeleteTopic(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={subjects}
        keyExtractor={(s) => s.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!subjects.length}
        renderItem={({ item }) => {
          const meta = getSubjectMeta(item.name);
          return (
            <TouchableOpacity
              style={[styles.subjectCard, { backgroundColor: colors.card }]}
              onPress={() => setSelectedSubject(item)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={meta.grad as [string, string]} style={styles.subjectIcon}>
                <MaterialCommunityIcons name={meta.name} size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.subjectName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.subjectTeacher, { color: colors.mutedForeground }]}>{item.teacher}</Text>
              <View style={[styles.topicsChip, { backgroundColor: meta.bg }]}>
                <Text style={[styles.topicsChipText, { color: meta.color }]}>
                  {item.topics.length} Topics
                </Text>
              </View>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.deleteSubjectBtn}
                  onPress={() => setConfirmDeleteSubjectId(item.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="trash-outline" size={15} color="#EF4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No subjects added yet</Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!confirmDeleteSubjectId}
        title="Delete Subject"
        message="Remove this subject and all its topics?"
        confirmLabel="Delete"
        onConfirm={confirmDeleteSubject}
        onCancel={() => setConfirmDeleteSubjectId(null)}
      />

      <ConfirmModal
        visible={!!confirmDeleteTopic}
        title="Delete Topic"
        message="Remove this topic from the syllabus?"
        confirmLabel="Delete"
        onConfirm={confirmDeleteTopicFn}
        onCancel={() => setConfirmDeleteTopic(null)}
      />

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddSubject(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7043', '#F4511E']} style={styles.fabGrad}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Subject Detail Modal */}
      <Modal visible={!!liveSelected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { backgroundColor: '#FFFFFF' }]}>
            {liveSelected && (() => {
              const meta = getSubjectMeta(liveSelected.name);
              return (
                <>
                  <LinearGradient colors={meta.grad as [string, string]} style={styles.detailHeader}>
                    <MaterialCommunityIcons name={meta.name} size={32} color="#FFFFFF" />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.detailHeaderName}>{liveSelected.name}</Text>
                      <Text style={styles.detailHeaderTeacher}>{liveSelected.teacher}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedSubject(null)}>
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </LinearGradient>

                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
                    <View style={styles.topicsHeader}>
                      <Text style={styles.topicsTitle}>Syllabus / Topics</Text>
                      {isAdmin && (
                        <TouchableOpacity onPress={() => setShowAddTopic(true)}>
                          <Ionicons name="add-circle" size={24} color={meta.color} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {liveSelected.topics.length === 0 ? (
                      <Text style={[styles.emptyTopics, { color: colors.mutedForeground }]}>
                        No topics added yet
                      </Text>
                    ) : (
                      liveSelected.topics.map((topic, i) => (
                        <View key={topic.id} style={[styles.topicItem, { borderLeftColor: meta.color }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.topicTitle, { color: colors.foreground }]}>
                              {i + 1}. {topic.title}
                            </Text>
                            {topic.description ? (
                              <Text style={[styles.topicDesc, { color: colors.mutedForeground }]}>
                                {topic.description}
                              </Text>
                            ) : null}
                          </View>
                          {isAdmin && (
                            <TouchableOpacity
                              onPress={() => setConfirmDeleteTopic({ subjectId: liveSelected.id, topicId: topic.id })}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    )}
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Add Subject Modal */}
      <Modal visible={showAddSubject} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.modalTitle}>Add Subject</Text>
            <TextInput style={styles.modalInput} placeholder="Subject Name" placeholderTextColor="#9CA3AF" value={subjectName} onChangeText={setSubjectName} />
            <TextInput style={styles.modalInput} placeholder="Teacher Name" placeholderTextColor="#9CA3AF" value={subjectTeacher} onChangeText={setSubjectTeacher} />
            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => { setShowAddSubject(false); setFormError(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleAddSubject}>
                <Text style={styles.saveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Topic Modal */}
      <Modal visible={showAddTopic} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.modalTitle}>Add Topic</Text>
            <TextInput style={styles.modalInput} placeholder="Topic Title" placeholderTextColor="#9CA3AF" value={topicTitle} onChangeText={setTopicTitle} />
            <TextInput
              style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={topicDesc}
              onChangeText={setTopicDesc}
              multiline
            />
            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => { setShowAddTopic(false); setFormError(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleAddTopic}>
                <Text style={styles.saveText}>Add Topic</Text>
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
  listContent: { padding: 16 },
  subjectCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#3949AB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  subjectIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  subjectName: { fontSize: 14, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 3 },
  subjectTeacher: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 8 },
  topicsChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  topicsChipText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  deleteSubjectBtn: { position: 'absolute', top: 10, right: 10 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  detailModal: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 24 },
  detailHeaderName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  detailHeaderTeacher: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  topicsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  topicsTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1A237E' },
  emptyTopics: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 24 },
  topicItem: { borderLeftWidth: 3, paddingLeft: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start' },
  topicTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  topicDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  inputModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A237E', marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E7FF', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1A237E', marginBottom: 12 },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnSave: { backgroundColor: '#5C6BC0' },
  saveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
