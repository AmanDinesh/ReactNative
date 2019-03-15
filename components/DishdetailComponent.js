import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (comment) => dispatch(postComment(comment))
});

let id=100;

function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    
    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => 
            console.log(endState.finished ? 'finished' : 'cancelled'));},
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );

            return true;
        }
    })
    
        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                    ref={this.handleViewRef}
                    {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{ uri: baseUrl + dish.image }}
                >
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                        />
                        <Icon 
                            raised
                            reverse
                            name='pencil'
                            type='font-awesome'
                            color='#512DA8'
                            onPress={() => props.toggleModal()}
                        />
                    </View>
                </Card>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}

function RenderComments(props) {
    const comments = props.comments;
    
    const renderCommentItem = ({ item, index }) => { 

        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 14}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date }</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
            <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
            />
            </Card>
        </Animatable.View>
    );
}

function RenderRating(props) {
    return (
        <Rating
            imageSize = {18}
            type='star'
            readonly = {true}
            ratingColor='#F1C40F'
            startingValue= {0 + props.stars}            
        />
    )
}


class Dishdetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            rating: 3,
            comment: '',
            author: ''
        }
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment() {
        const values = {
            id: ++id,
            dishId: this.props.navigation.getParam('dishId', ''),
            rating: this.state.rating,
            author: this.state.author,
            comment: this.state.comment,
            date: new Date().toISOString()
        }
        this.toggleModal();
        console.log(JSON.stringify(values))
        this.props.postComment(values)

    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    DisplayModal() {
        this.toggleModal();
    }

    ratingCompleted(rating) {
        console.log("Rating is: " + rating)
      }

    

    render() {
        const dishId = this.props.navigation.getParam('dishId','');

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    toggleModal={() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal()}
                    onRequestClose = {() => this.toggleModal()} >
                    <View style={StyleSheet.modal}>
                        <View>
                        <Rating
                            type='star'
                            ratingCount={5}
                            ratingColor='#F1C40F'
                            onFinishRating={(rating) => this.setState({rating: rating})}
                            showRating={true}
                        />
                        </View>
                        <View>
                            <Input
                                placeholder=' Author'
                                leftIcon={
                                    <Icon
                                    name='user-o'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                    />
                                }
                                onChangeText={(text) => this.setState({author: text})}
                            />
                            <Input
                                placeholder=' Comment'
                                leftIcon={
                                    <Icon
                                    name='comment-o'
                                    type='font-awesome'
                                    size={24}
                                    color='black'
                                />
                                }
                                onChangeText={(text) => this.setState({comment: text})}
                            />
                        </View>
                        <View style={styles.formRow}>
                                <Button
                                    onPress = {()  => this.handleComment()}
                                    color="#512DA8"
                                    title="SUBMIT"
                                />
                        </View>
                        <View style={styles.formRow}>
                                <Button
                                    onPress = {() => this.toggleModal()}
                                    color="grey"
                                    title="CANCEL"
                                />

                        </View>
                    </View>   
                    
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
});


export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);