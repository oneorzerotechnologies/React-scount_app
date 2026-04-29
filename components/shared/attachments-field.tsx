import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type Attachment = {
  id:       string;
  uri:      string;
  name:     string;
  size:     number;
  mimeType: string;
  isImage:  boolean;
};

const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED  = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function humanSize(b: number): string {
  if (b < 1024)    return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

function isImageMime(m: string): boolean {
  return m.startsWith('image/');
}

export function AttachmentsField({
  value,
  onChange,
}: {
  value:    Attachment[];
  onChange: (next: Attachment[]) => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];
  const [sourceOpen, setSourceOpen] = useState(false);

  const room = MAX_FILES - value.length;

  const validate = (file: { size: number; mimeType: string; name: string }): string | null => {
    if (file.size > MAX_BYTES)            return `${file.name} exceeds 10 MB`;
    if (!ACCEPTED.includes(file.mimeType)) return `${file.name} is not an allowed type`;
    return null;
  };

  const append = (incoming: Attachment[]) => {
    const slice = incoming.slice(0, room);
    onChange([...value, ...slice]);
    if (incoming.length > room) {
      Alert.alert('Limit reached', `Only ${room} more file(s) can be attached. ${incoming.length - room} skipped.`);
    }
  };

  const pickDocument = async () => {
    setSourceOpen(false);
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type:     ACCEPTED,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;

    const errors: string[] = [];
    const files: Attachment[] = [];
    for (const a of res.assets) {
      const mime = a.mimeType ?? 'application/octet-stream';
      const size = a.size ?? 0;
      const err  = validate({ size, mimeType: mime, name: a.name });
      if (err) { errors.push(err); continue; }
      files.push({
        id:       `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        uri:      a.uri,
        name:     a.name,
        size,
        mimeType: mime,
        isImage:  isImageMime(mime),
      });
    }
    if (errors.length) Alert.alert('Some files skipped', errors.join('\n'));
    if (files.length)  append(files);
  };

  const pickImagesFromLibrary = async () => {
    setSourceOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:    ['images'],
      allowsMultipleSelection: true,
      selectionLimit: room,
      quality:       0.85,
    });
    if (res.canceled) return;

    const errors: string[] = [];
    const files: Attachment[] = [];
    for (const a of res.assets) {
      const mime = a.mimeType ?? 'image/jpeg';
      const size = a.fileSize ?? 0;
      const name = a.fileName ?? `image-${Date.now()}.jpg`;
      const err  = validate({ size, mimeType: mime, name });
      if (err) { errors.push(err); continue; }
      files.push({
        id:       `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        uri:      a.uri,
        name,
        size,
        mimeType: mime,
        isImage:  true,
      });
    }
    if (errors.length) Alert.alert('Some files skipped', errors.join('\n'));
    if (files.length)  append(files);
  };

  const takePhoto = async () => {
    setSourceOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (res.canceled) return;

    const a    = res.assets[0];
    const mime = a.mimeType ?? 'image/jpeg';
    const size = a.fileSize ?? 0;
    const name = a.fileName ?? `photo-${Date.now()}.jpg`;
    const err  = validate({ size, mimeType: mime, name });
    if (err) { Alert.alert('File rejected', err); return; }
    append([{
      id:       `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      uri:      a.uri,
      name,
      size,
      mimeType: mime,
      isImage:  true,
    }]);
  };

  const remove = (id: string) => onChange(value.filter((f) => f.id !== id));

  return (
    <View style={[styles.card, { borderColor: palette.border }]}>
      <View style={[styles.header, { borderColor: palette.border, backgroundColor: palette.surface }]}>
        <IconSymbol name="paperclip" size={14} color="#f43f5e" />
        <Text style={[styles.headerTitle, { color: palette.textMuted }]}>
          ATTACHMENTS{' '}
          <Text style={[styles.headerHint, { color: palette.textMuted }]}>
            (receipts, invoices — up to 10 files, 10 MB each)
          </Text>
        </Text>
      </View>

      <View style={styles.body}>
        {value.length > 0 && (
          <View style={styles.grid}>
            {value.map((f) => (
              <View key={f.id} style={[styles.tile, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                {f.isImage ? (
                  <Image source={{ uri: f.uri }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.docThumb, { backgroundColor: palette.background }]}>
                    <IconSymbol name="doc.fill" size={28} color={slate[400]} />
                  </View>
                )}
                <View style={styles.meta}>
                  <Text style={[styles.metaName, { color: palette.text }]} numberOfLines={1}>{f.name}</Text>
                  <Text style={[styles.metaSize, { color: palette.textMuted }]}>{humanSize(f.size)}</Text>
                </View>
                <Pressable onPress={() => remove(f.id)} style={styles.removeBtn} hitSlop={6}>
                  <IconSymbol name="xmark" size={11} color="#dc2626" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => setSourceOpen(true)}
          disabled={room <= 0}
          style={({ pressed }) => [
            styles.dropZone,
            { borderColor: palette.border, backgroundColor: palette.surface },
            pressed && { opacity: 0.85 },
            room <= 0 && { opacity: 0.5 },
          ]}
        >
          <IconSymbol name="arrow.up.circle" size={28} color={slate[400]} />
          <Text style={[styles.dropTitle, { color: palette.text }]}>
            {room <= 0 ? 'Maximum 10 files attached' : 'Tap to attach files'}
          </Text>
          <Text style={[styles.dropHint, { color: palette.textMuted }]}>
            PDF, JPG, PNG, WEBP, GIF — max 10 MB each
          </Text>
        </Pressable>
      </View>

      <Modal visible={sourceOpen} animationType="slide" transparent onRequestClose={() => setSourceOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSourceOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: palette.background }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: palette.text }]}>Attach from</Text>
            <ScrollView>
              <SourceRow palette={palette} icon="camera.fill" label="Camera"           onPress={takePhoto} />
              <SourceRow palette={palette} icon="photo.fill"  label="Photo Library"    onPress={pickImagesFromLibrary} />
              <SourceRow palette={palette} icon="doc.fill"    label="Files (PDF, etc)" onPress={pickDocument} />
            </ScrollView>
            <Pressable onPress={() => setSourceOpen(false)} style={styles.sheetCancel}>
              <Text style={[styles.sheetCancelText, { color: moss[700] }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SourceRow({
  palette, icon, label, onPress,
}: {
  palette: typeof Colors.light | typeof Colors.dark;
  icon:    Parameters<typeof IconSymbol>[0]['name'];
  label:   string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceRow,
        { borderColor: palette.border },
        pressed && { backgroundColor: palette.surface },
      ]}
    >
      <IconSymbol name={icon} size={20} color={moss[600]} />
      <Text style={[styles.sourceLabel, { color: palette.text }]}>{label}</Text>
      <IconSymbol name="chevron.right" size={14} color={slate[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  headerHint:  { fontSize: 10, fontWeight: '400', letterSpacing: 0 },

  body: { padding: 14, gap: 12 },

  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile:  {
    width: '48%', borderWidth: 1, borderRadius: 10, overflow: 'hidden',
    position: 'relative',
  },
  thumb: { width: '100%', aspectRatio: 16 / 10 },
  docThumb: { alignItems: 'center', justifyContent: 'center' },
  meta:  { paddingHorizontal: 8, paddingVertical: 6 },
  metaName: { fontSize: 11, fontWeight: '700' },
  metaSize: { fontSize: 10, marginTop: 1 },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    width: 22, height: 22, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },

  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 22, paddingHorizontal: 16,
    alignItems: 'center', gap: 6,
  },
  dropTitle: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  dropHint:  { fontSize: 11 },

  sheetRoot:     { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: slate[300], marginBottom: 10,
  },
  sheetTitle:  { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  sourceRow:   {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sourceLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  sheetCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  sheetCancelText: { fontSize: 14, fontWeight: '700' },
});
