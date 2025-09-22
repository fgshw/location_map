import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  MapViewProps,
} from "react-native-maps";

type SavedPlace = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState({
    latitude: 17.803266,
    longitude: 102.747888,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeDescription, setPlaceDescription] = useState("");
  const mapRef = useRef<MapView>(null);

  // ขอ Permission และดึงตำแหน่งเริ่มต้น
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let current = await Location.getCurrentPositionAsync({});
      setLocation(current);
      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // ฟังก์ชันกดปุ่มหาตำแหน่งปัจจุบัน
  const handleGetLocation = async () => {
    let current = await Location.getCurrentPositionAsync({});
    setLocation(current);
    setRegion({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    mapRef.current?.animateToRegion(region, 1000);
  };

  // ฟังก์ชันกดบันทึกสถานที่
  const handleSavePlace = () => {
    if (!location) return;

    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      name: placeName || "สถานที่ที่บันทึก",
      description: placeDescription || "ไม่มีคำบรรยาย",
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setSavedPlaces([...savedPlaces, newPlace]);
    setPlaceName("");
    setPlaceDescription("");
    setModalVisible(false);
  };

  // ฟังก์ชันเมื่อเลือกจากรายการ
  const handleSelectPlace = (place: SavedPlace) => {
    setRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    mapRef.current?.animateToRegion(region, 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={true}
      >
        {savedPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.description}
            pinColor="blue"
          />
        ))}
      </MapView>

      {/* ปุ่ม */}
      <View style={styles.buttons}>
        <Button title="ตำแหน่งปัจจุบัน" onPress={handleGetLocation} />
        <Button title="บันทึกสถานที่" onPress={() => setModalVisible(true)} />
      </View>

      {/* รายการสถานที่ */}
      <FlatList
        style={styles.list}
        data={savedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleSelectPlace(item)}
          >
            <Text style={styles.placeName}>{item.name}</Text>
            <Text style={styles.placeDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal สำหรับกรอกชื่อ/คำบรรยาย */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text>ชื่อสถานที่:</Text>
            <TextInput
              style={styles.input}
              value={placeName}
              onChangeText={setPlaceName}
              placeholder="กรอกชื่อ..."
            />
            <Text>คำบรรยาย:</Text>
            <TextInput
              style={styles.input}
              value={placeDescription}
              onChangeText={setPlaceDescription}
              placeholder="กรอกคำบรรยาย..."
            />
            <Button title="บันทึก" onPress={handleSavePlace} />
            <Button title="ยกเลิก" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: 5,
  },
  list: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: 200,
    backgroundColor: "white",
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  placeName: {
    fontWeight: "bold",
  },
  placeDesc: {
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalBox: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 5,
    borderRadius: 5,
  },
});
