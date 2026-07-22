import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAuth, User } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const { user, users, logout, addUser, removeUser } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // Add user modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'student'>('student');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  async function handleAddUser() {
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      setAddError('All fields are required');
      return;
    }
    if (newPassword.trim().length < 4) {
      setAddError('Password must be at least 4 characters');
      return;
    }
    setAddLoading(true);
    const result = await addUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim(),
      role: newRole,
    });
    setAddLoading(false);
    if (result.success) {
      setShowAddUser(false);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewRole('student');
      setAddError('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setAddError(result.error ?? 'Failed to add user');
    }
  }

  async function handleDeleteUser(u: User) {
    if (u.id === user?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }
    Alert.alert('Delete User', `Remove ${u.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeUser(u.id);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#3949AB', '#5C6BC0']}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.card, { marginTop: -20 }]}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#5C6BC0', '#7E57C2']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user?.name ?? 'U')}</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user?.role === 'admin' ? '#E8EAF6' : '#E0F7FA' }]}>
            <MaterialCommunityIcons
              name={user?.role === 'admin' ? 'shield-crown' : 'account-school'}
              size={14}
              color={user?.role === 'admin' ? '#3949AB' : '#00838F'}
            />
            <Text style={[styles.roleText, { color: user?.role === 'admin' ? '#3949AB' : '#00838F' }]}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </Text>
          </View>
        </View>

        {/* Credentials Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT CREDENTIALS</Text>
          <View style={[styles.card, styles.cardPadded]}>
            {/* Username row */}
            <View style={styles.credRow}>
              <View style={styles.credIcon}>
                <Ionicons name="person-outline" size={18} color="#5C6BC0" />
              </View>
              <View style={styles.credInfo}>
                <Text style={[styles.credLabel, { color: colors.mutedForeground }]}>Username</Text>
                <Text style={[styles.credValue, { color: colors.foreground }]}>{user?.username}</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            {/* Password row */}
            <View style={styles.credRow}>
              <View style={styles.credIcon}>
                <Ionicons name="lock-closed-outline" size={18} color="#5C6BC0" />
              </View>
              <View style={styles.credInfo}>
                <Text style={[styles.credLabel, { color: colors.mutedForeground }]}>Password</Text>
                <Text style={[styles.credValue, { color: colors.foreground }]}>
                  {showPassword ? user?.password : '••••••••'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Admin: User Management */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              USER MANAGEMENT ({users.length}/55)
            </Text>
            <View style={[styles.card, styles.cardPadded]}>
              {users.map((u, i) => (
                <React.Fragment key={u.id}>
                  {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  <View style={styles.userRow}>
                    <View style={[styles.userAvatar, { backgroundColor: u.role === 'admin' ? '#E8EAF6' : '#E0F7FA' }]}>
                      <Text style={[styles.userAvatarText, { color: u.role === 'admin' ? '#3949AB' : '#00838F' }]}>
                        {initials(u.name)}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userRowName, { color: colors.foreground }]}>{u.name}</Text>
                      <Text style={[styles.userRowUsername, { color: colors.mutedForeground }]}>
                        @{u.username} · {u.role}
                      </Text>
                    </View>
                    {u.id !== user?.id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteUser(u)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </React.Fragment>
              ))}
            </View>
            <TouchableOpacity
              style={styles.addUserBtn}
              onPress={() => setShowAddUser(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#00BCD4', '#0097A7']}
                style={styles.addUserBtnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                <Text style={styles.addUserBtnText}>Add New User</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Class 10th H E~portal · Secure Access
        </Text>
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={showAddUser} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: '#1A237E' }]}>Add New User</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password (min 4 chars)"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={[styles.modalLabel, { color: '#6B7280' }]}>Role</Text>
            <View style={styles.roleRow}>
              {(['student', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, newRole === r && styles.roleChipActive]}
                  onPress={() => setNewRole(r)}
                >
                  <Text style={[styles.roleChipText, newRole === r && styles.roleChipTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {addError ? <Text style={styles.modalError}>{addError}</Text> : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => { setShowAddUser(false); setAddError(''); }}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnAdd]}
                onPress={handleAddUser}
                disabled={addLoading}
              >
                <Text style={styles.modalBtnAddText}>Add User</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  scroll: { paddingHorizontal: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#3949AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  cardPadded: { padding: 4 },
  // Profile
  avatarContainer: { alignItems: 'center', marginTop: 24, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  userName: { fontSize: 20, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  roleText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  section: { marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  // Credentials
  credRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  credIcon: { width: 36, alignItems: 'center' },
  credInfo: { flex: 1, marginLeft: 4 },
  credLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  credValue: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, marginHorizontal: 16 },
  // User list
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  userInfo: { flex: 1, marginLeft: 12 },
  userRowName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  userRowUsername: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  addUserBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  addUserBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  addUserBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  logoutText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#EF4444' },
  footer: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8, marginBottom: 8 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 20 },
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
  modalLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
  },
  roleChipActive: { backgroundColor: '#5C6BC0', borderColor: '#5C6BC0' },
  roleChipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  roleChipTextActive: { color: '#FFFFFF' },
  modalError: { fontSize: 13, color: '#EF4444', fontFamily: 'Inter_400Regular', marginBottom: 12 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#E0E7FF' },
  modalBtnCancelText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#6B7280' },
  modalBtnAdd: { backgroundColor: '#5C6BC0' },
  modalBtnAddText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
});
