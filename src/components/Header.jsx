import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const COLORS = {
  primary: '#FFA652',
  inputBg: '#2D2B2B',
  inputText: '#E5E5E5',
  placeholder: '#6C6767',
};

export default function Header() {
  const navigation = useNavigation();
  const route = useRoute();

  const onPressUser = () => {
    if (route.name === 'Profile') {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  const goSearch = () => navigation.navigate('Search');

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onPressUser} accessibilityRole="button" accessibilityLabel="Profile">
          <FontAwesome5 name="user" size={22} color="#D1D5DB" />
        </TouchableOpacity>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.input}
            placeholder="Where do you want to go?"
            placeholderTextColor={COLORS.placeholder}
            editable={false}
            onFocus={goSearch}
            onTouchStart={goSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={goSearch} accessibilityRole="button" accessibilityLabel="Search">
            <FontAwesome5 name="search" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingVertical: 12,
  },
  row: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    color: COLORS.inputText,
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 40,
    paddingVertical: 10,
  },
  searchBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

