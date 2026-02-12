// filepath: d:\Documentos\Code\Projetos\document-app\src\screens\share\styles\QRCodeScannerScreen.style.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scanSize = width * 0.7;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: scanSize,
    marginTop: 30,
  },
  scanFrame: {
    width: scanSize,
    height: scanSize,
    borderWidth: 2,
    borderColor: '#2196f3',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  instructions: {
    alignItems: 'center',
    padding: 24,
    marginTop: 24,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  helpText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    alignSelf: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonOutlineText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  scanAgainButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 60,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  permissionIcon: {
    marginBottom: 20,
  }
});