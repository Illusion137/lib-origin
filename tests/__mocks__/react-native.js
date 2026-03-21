module.exports = {
  Platform: { OS: 'android', select: (obj) => obj.android },
  StyleSheet: { create: (obj) => obj, flatten: (obj) => obj },
  View: ({ children }) => children,
  Text: ({ children }) => children,
  Image: () => null,
  TouchableOpacity: ({ children, onPress }) => children, // Mock interactivity if needed
  // Add other components as needed
};
