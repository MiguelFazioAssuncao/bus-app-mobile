import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#2D2B2B';
const ACTIVE = '#3B82F6';
const INACTIVE = '#FFFFFF';

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const isActive = (name) => route.name === name;

  const Item = ({ label, icon, target }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate(target)}>
      <FontAwesome5 name={icon} size={18} color={isActive(target) ? ACTIVE : INACTIVE} />
      <Text style={[styles.label, { color: isActive(target) ? ACTIVE : INACTIVE }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}> 
      <View style={styles.row}>
        <Item label="Directions" icon="route" target="Directions" />
        <Item label="Stations" icon="map-marker-alt" target="Stations" />
        <Item label="Lines" icon="ellipsis-h" target="Lines" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});

