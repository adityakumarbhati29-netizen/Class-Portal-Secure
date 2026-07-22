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
import { useData, SoftBoardPost } from '@/contexts/DataContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '@/components/ConfirmModal';

const CARD_COLORS: Array<[string, string]> = [
  ['#5C6BC0', '#3949AB'],
  ['#00838F', '#00BCD4'],
  ['#E65100', '#FF7043'],
  ['#AD1457', '#E91E63'],
  ['#2E7D32', '#43A047'],
  ['#6A1B9A', '#AB47BC'],
  ['#F57F17', '#FFD54F'],
  ['#0277BD', '#29B6F6'],
];

function PostCard({ post, isAdmin, onDelete, onTogglePin }: {
  post: SoftBoardPost;
  isAdmin: boolean;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const gradColors = CARD_COLORS[post.colorIndex % CARD_COLORS.length];
  return (
    <View style={styles.postCard}>
      <LinearGradient colors={gradColors} style={styles.postCardGrad}>
        <View style={styles.postCardTop}>
          {post.pinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={10} color={gradColors[0]} />
              <Text style={[styles.pinnedText, { color: gradColors[0] }]}>Pinned</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity onPress={onTogglePin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={post.pinned ? 'pin' : 'pin-outline'} size={16} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent} numberOfLines={4}>{post.content}</Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function SoftBoardScreen() {
  const { user } = useAuth();
  const { softBoardPosts, addSoftBoardPost, deleteSoftBoardPost, updateSoftBoardPost } = useData();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [formError, setFormError] = useState('');

  const sorted = [...softBoardPosts].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 80;

  async function handleAdd() {
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    await addSoftBoardPost({
      title: title.trim(),
      content: content.trim(),
      date: today,
      author: user?.name ?? 'Admin',
      pinned,
      colorIndex,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setTitle(''); setContent(''); setPinned(false); setColorIndex(0); setFormError('');
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    await deleteSoftBoardPost(confirmDeleteId);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmDeleteId(null);
  }

  async function handleTogglePin(post: SoftBoardPost) {
    await updateSoftBoardPost(post.id, { pinned: !post.pinned });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header banner */}
      <LinearGradient colors={['#5C6BC0', '#7E57C2']} style={styles.headerBanner}>
        <Ionicons name="pin" size={18} color="rgba(255,255,255,0.9)" />
        <Text style={styles.headerBannerText}>Class Soft Board</Text>
      </LinearGradient>

      <FlatList
        data={sorted}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isAdmin={isAdmin}
            onDelete={() => setConfirmDeleteId(item.id)}
            onTogglePin={() => handleTogglePin(item)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!sorted.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="pin-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Soft board is empty</Text>
          </View>
        }
      />

      <ConfirmModal
        visible={!!confirmDeleteId}
        title="Delete Post"
        message="Remove this post from the soft board?"
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
            <Text style={styles.modalTitle}>New Post</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Content"
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
            />

            {/* Color Picker */}
            <Text style={styles.colorLabel}>Card Color</Text>
            <View style={styles.colorRow}>
              {CARD_COLORS.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setColorIndex(i)}
                  style={[styles.colorDot, colorIndex === i && styles.colorDotSelected]}
                >
                  <LinearGradient colors={c} style={styles.colorDotInner} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Pin Toggle */}
            <TouchableOpacity
              style={[styles.pinToggle, pinned && styles.pinToggleActive]}
              onPress={() => setPinned((v) => !v)}
            >
              <Ionicons name={pinned ? 'pin' : 'pin-outline'} size={16} color={pinned ? '#5C6BC0' : '#9CA3AF'} />
              <Text style={[styles.pinToggleText, { color: pinned ? '#5C6BC0' : '#9CA3AF' }]}>
                {pinned ? 'Pinned to top' : 'Pin to top'}
              </Text>
            </TouchableOpacity>

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
  headerBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  headerBannerText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)' },
  listContent: { padding: 16 },
  postCard: { marginBottom: 14, borderRadius: 20, overflow: 'hidden', shadowColor: '#3949AB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  postCardGrad: { padding: 20 },
  postCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pinnedText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  adminActions: { flexDirection: 'row', gap: 12 },
  postTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginBottom: 8 },
  postContent: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.9)', lineHeight: 21, marginBottom: 16 },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postAuthor: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.8)' },
  postDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  fab: { position: 'absolute', right: 20, bottom: Platform.OS === 'web' ? 120 : 96, borderRadius: 30, shadowColor: '#FF7043', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 10 },
  fabGrad: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A237E', marginBottom: 20 },
  modalInput: { backgroundColor: '#F5F7FF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E7FF', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#1A237E', marginBottom: 12 },
  colorLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#6B7280', marginBottom: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  colorDot: { width: 30, height: 30, borderRadius: 15, padding: 3, borderWidth: 2, borderColor: 'transparent' },
  colorDotSelected: { borderColor: '#5C6BC0' },
  colorDotInner: { flex: 1, borderRadius: 12 },
  pinToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF', marginBottom: 14, alignSelf: 'flex-start' },
  pinToggleActive: { borderColor: '#5C6BC0', backgroundColor: '#E8EAF6' },
  pinToggleText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnSave: { backgroundColor: '#5C6BC0' },
  saveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
