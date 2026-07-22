import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useData, Notice } from '@/contexts/DataContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '@/components/ConfirmModal';

const PRIORITY_CONFIG = {
  high: { color: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', label: 'High Priority', icon: 'alert-circle' as const, grad: ['#C62828', '#EF5350'] as [string, string] },
  medium: { color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', label: 'Medium', icon: 'information-circle' as const, grad: ['#E65100', '#FF7043'] as [string, string] },
  low: { color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7', label: 'Low', icon: 'checkmark-circle' as const, grad: ['#2E7D32', '#43A047'] as [string, string] },
};

function NoticeCard({ notice, isAdmin, onDelete }: {
  notice: Notice;
  isAdmin: boolean;
  onDelete: () => void;
}) {
  const colors = useColors();
  const config = PRIORITY_CONFIG[notice.priority];
  return (
    <View style={[styles.noticeCard, { backgroundColor: colors.card, borderLeftColor: config.color }]}>
      <View style={styles.noticeTop}>
        <View style={[styles.priorityBadge, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.priorityText, { color: config.color }]}>{config.label}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{notice.title}</Text>
      <Text style={[styles.noticeContent, { color: colors.mutedForeground }]}>{notice.content}</Text>
      <View style={styles.noticeMeta}>
        <View style={styles.noticeMetaItem}>
          <Ionicons name="person-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.noticeMetaText, { color: colors.mutedForeground }]}>{notice.author}</Text>
        </View>
        <View style={styles.noticeMetaItem}>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.noticeMetaText, { color: colors.mutedForeground }]}>{notice.date}</Text>
        </View>
      </View>
    </View>
  );
}

export default function NoticeScreen() {
  const { user } = useAuth();
  const { notices, addNotice, deleteNotice } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formError, setFormError] = useState('');

  const sorted = [...notices].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  async function handleAdd() {
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    await addNotice({
      title: title.trim(),
      content: content.trim(),
      date: today,
      priority,
      author: user?.name ?? 'Admin',
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setTitle(''); setContent(''); setPriority('medium'); setFormError('');
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    await deleteNotice(confirmDeleteId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmDeleteId(null);
  }

  // Count stats
  const highCount = notices.filter((n) => n.priority === 'high').length;
  const totalCount = notices.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Ionicons name="alert-circle" size={16} color="#C62828" />
          <Text style={[styles.statNum, { color: '#C62828' }]}>{highCount}</Text>
          <Text style={[styles.statLabel, { color: '#C62828' }]}>High Priority</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8EAF6' }]}>
          <Ionicons name="notifications" size={16} color="#3949AB" />
          <Text style={[styles.statNum, { color: '#3949AB' }]}>{totalCount}</Text>
          <Text style={[styles.statLabel, { color: '#3949AB' }]}>Total Notices</Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NoticeCard
            notice={item}
            isAdmin={isAdmin}
            onDelete={() => setConfirmDeleteId(item.id)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!sorted.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notices yet</Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!confirmDeleteId}
        title="Delete Notice"
        message="Remove this notice from the board?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#FF7043', '#F4511E']} style={styles.fabGrad}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Notice</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Notice content"
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
            />

            {/* Priority */}
            <Text style={styles.priorityLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityChip, { borderColor: cfg.color }, priority === p && { backgroundColor: cfg.bg }]}
                    onPress={() => setPriority(p)}
                  >
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[styles.priorityChipText, { color: cfg.color }]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => { setShowModal(false); setFormError(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleAdd}>
                <Text style={styles.saveText}>Post</Text>
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
  statsRow: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 8 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  statNum: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  noticeCard: {
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  noticeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  noticeTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  noticeContent: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 12 },
  noticeMeta: { flexDirection: 'row', gap: 16 },
  noticeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noticeMetaText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  fab: { position: 'absolute', right: 20, bottom: Platform.OS === 'web' ? 120 : 96, borderRadius: 30, shadowColor: '#FF7043', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  fabGrad: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A237E', marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E7FF', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1A237E', marginBottom: 12 },
  priorityLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#6B7280', marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  priorityChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderRadius: 8, borderWidth: 1 },
  priorityChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnSave: { backgroundColor: '#5C6BC0' },
  saveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
