import * as React from "react";
import { ReactNode } from "react";
import { Button, View, Text, StyleSheet, AppRegistry, TextInput } from "react-native";
import { Alert, AlertButton } from "react-native";
import { FlatList } from "react-native";
import { TouchableHighlight } from "react-native";
import { Modal } from "react-native";
import { ListRenderItemInfo } from "react-native";
import { TouchableNativeFeedback } from "react-native";
import { Platform } from "react-native";

const ANDROID = 'android';

interface Props {
    message?: string;
}

interface State {
    text: string;
    listItems: ListItem[];
    itemModal: {
        show: boolean;
        item?: ListItem
    }
}

interface ListItem {
    id: number;
    text: string;
    show: boolean;
}

export default class HelloWorld extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            text: '',
            itemModal: {
                show: false
            },
            listItems: [
                {
                    id: 1,
                    text: 'Yo!',
                    show: true
                },
                {
                    id: 2,
                    text: `I'm content!`,
                    show: true
                }
            ]
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View>
                    <TextInput style={styles.input} onChangeText={text => this.setState({ text })}></TextInput>
                    <Text>Here's what I thought you said: {this.state.text}</Text>
                    <Text>Oh, also here's the message from the parent component: {this.props.message}</Text>
                </View>

                <View>
                    <Button title="Press me!" onPress={this.onPressButton.bind(this)}></Button>
                </View>

                <View style={{ maxHeight: '30%' }}>
                    <FlatList
                        data={this.state.listItems}
                        renderItem={this.renderListItem.bind(this)}
                        keyExtractor={(item, index) => index.toString()}>
                    </FlatList>
                </View>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.itemModal.show}
                    onRequestClose={() => { }}>
                    <Text>{this.state.itemModal.item && this.state.itemModal.item.text}</Text>
                    <Button title="Dismiss" onPress={this.onPressDimissItemModal.bind(this)}></Button>
                </Modal>
            </View>
        )
    }

    onPressButton(): any {
        const buttons: AlertButton[] = [
            {
                text: 'Cool!',
                onPress: () => {
                    Alert.alert('Dope!');
                }
            }
        ];

        Alert.alert(`I'm an alert!`, `which means you pressed the button!`, buttons);
    }

    renderListItem(info: ListRenderItemInfo<{}>) {
        const item = info.item as ListItem;

        const onPress = () => {
            this.setState({
                itemModal: {
                    ...this.state.itemModal,
                    show: true,
                    item: item
                }
            });
        };
        return (
            <TouchableNativeFeedback onPress={onPress}>
                <View
                    style={{
                        justifyContent: 'center',
                        borderColor: 'black',
                        borderWidth: 1,
                        marginTop: 5,
                        marginBottom: 5,
                        paddingLeft: 5,
                        height: 40
                    }}>
                    <Text>{item.text}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }

    onPressDimissItemModal() {
        this.setState({
            itemModal: {
                ...this.state.itemModal,
                show: false
            }
        })
    }
}

const styles = StyleSheet.create({
    container: {
    },
    input: {
        height: 40
    }
});