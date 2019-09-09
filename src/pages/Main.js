import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Modal, View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';

import logo from '../assets/logo.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
    const id = navigation.getParam('user');
    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState(null);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        async function loadUsers() {
            const response = await api.get(`/devs`, {
                headers: { user: id }
            });

            setUsers(response.data);
        }

        loadUsers();
    }, [id]);

    useEffect(() => {
        const socket = io('http://192.168.11.9:3333');

        socket.emit('connectRoom', id);

        socket.on('match', dev => {
            setMatchDev(dev);
            setModal(true);
        });

    }, [id]);

    async function handleLogout() {
        await AsyncStorage.clear();

        navigation.navigate('Login');
    }
    async function handleLike() {
        const [user, ...rest] = users;

        await api.post(`/devs/${user._id}/likes`, null, {
            headers: { user: id }
        });

        setUsers(rest);
    }

    async function handleDislike() {
        const [user, ...rest] = users;

        await api.post(`/devs/${user._id}/dislikes`, null, {
            headers: { user: id }
        });

        setUsers(rest);
    }
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image source={logo} style={styles.logo} />
            </TouchableOpacity>

            <View style={styles.cardContainer}>
                {users.length === 0 ? <Text style={styles.empty}>Acabou :(</Text>
                    : (
                        users.map((user, index) => (
                            <View key={user._id} style={[styles.card, { zIndex: users.length - index }]}>
                                <Image style={styles.avatar} source={{ uri: user.avatar }} />
                                <View style={styles.footer}>
                                    <Text style={styles.name}>{user.name}</Text>
                                    <Text style={styles.bio}>{user.bio}</Text>
                                </View>
                            </View>
                        ))
                    )}
            </View >

            {users.length > 0 && (
                <View style={styles.buttonsConatainer}>
                    <TouchableOpacity style={styles.button} onPress={handleDislike}>
                        <Image source={dislike} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleLike}>
                        <Image source={like} />
                    </TouchableOpacity>
                </View>
            )}

            {matchDev && (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={modal}
                >
                    <View style={styles.matchContainer}>
                        <Image style={styles.matchImage} source={itsamatch} />
                        <Image style={styles.avatarMatch} source={{ uri: matchDev.avatar }} />

                        <Text style={styles.nameMatch}>{matchDev.name}</Text>
                        <Text style={styles.bioMatch}>{matchDev.bio}</Text>

                        <TouchableOpacity onPress={() => { setMatchDev(null), setModal(!modal) }}>
                            <Text style={styles.closeMatch}>FECHAR</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    logo: {
        marginTop: 30
    },

    cardContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500
    },

    card: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        margin: 30,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    avatar: {
        flex: 1,
        height: 300
    },

    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15
    },

    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },

    bio: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18
    },

    buttonsConatainer: {
        flexDirection: 'row',
        marginBottom: 40
    },

    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: {
            width: 0,
            height: 2
        }
    },

    matchContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center'
    },

    matchImage: {
        height: 60,
        resizeMode: 'contain'
    },

    avatarMatch: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 5,
        borderColor: '#FFF',
        marginVertical: 30
    },

    nameMatch: {
        fontSize: 26,
        color: '#FFF',
        fontWeight: 'bold'
    },

    bioMatch: {
        marginTop: 10,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 30
    },

    closeMatch: {
        fontSize: 16,
        marginTop: 30,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    empty: {
        alignSelf: 'center',
        fontSize: 24,
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 50
    }
});