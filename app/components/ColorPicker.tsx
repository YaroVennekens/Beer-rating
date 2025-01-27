import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import {  X } from 'lucide-react-native';

interface ColorPickerProps {
    onColorSelect: (color: string) => void;
    onClose: () => void;
    initialColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect, onClose, initialColor = '#32a852' }) => {
    const [selectedColor, setSelectedColor] = React.useState({
        hex: initialColor,
        rgb: { r: 50, g: 168, b: 82 },
        cmyk: { c: 70, m: 0, y: 51, k: 34 },
        hsv: { h: 136, s: 70, v: 66 },
        hsl: { h: 136, s: 54, l: 43 },
    });
    const [hue, setHue] = React.useState(136);

    const handleColorSelect = () => {
        onColorSelect(selectedColor.hex);
        onClose();
    };

    return (
      <View style={styles.modalContainer}>
          <View style={styles.container}>
              <View style={styles.header}>
                  <Text style={styles.title}>Kleurkiezer</Text>
                  <View style={styles.headerButtons}>
                      <TouchableOpacity onPress={handleColorSelect} style={styles.saveButton}>
                          <Text style={styles.saveButtonText}>Toepassen</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onClose}>
                          <X color="#fff" size={24} />
                      </TouchableOpacity>
                  </View>
              </View>

              <View style={[styles.colorArea, { backgroundColor: selectedColor.hex }]}>
                  <LinearGradient
                    colors={['transparent', '#000']}
                    style={styles.gradientOverlay}
                  />
              </View>

              <View style={styles.controls}>
                  <Slider
                    style={styles.hueSlider}
                    minimumValue={0}
                    maximumValue={360}
                    value={hue}
                    onValueChange={(value) => {
                        setHue(value);
                        // In a real implementation, this would update the color based on HSL
                        const newHex = `hsl(${value}, 54%, 43%)`;
                        setSelectedColor(prev => ({ ...prev, hex: newHex }));
                    }}
                  />

                  <View style={styles.colorInfo}>
                      <Text style={styles.colorLabel}>HEX</Text>
                      <View style={styles.colorValue}>
                          <Text style={styles.colorText}>{selectedColor.hex}</Text>
                      </View>
                  </View>
              </View>
          </View>
      </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: 16,
    },
    container: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    colorArea: {
        height: Dimensions.get('window').width - 64,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    controls: {
        flex: 1,
    },
    hueSlider: {
        height: 40,
        marginBottom: 20,
    },
    colorInfo: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 16,
    },
    colorLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    colorValue: {
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 4,
    },
    colorText: {
        color: '#fff',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ColorPicker;

