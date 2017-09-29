import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  DeviceEventEmitter,
  Navigator,
  StyleSheet,
  Platform,
  Image,
  Linking,
  ScrollView,
  View,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  BackAndroid,
  Picker
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';

import { Text, SPMediumText, SPText, SPBoldText } from '../../common/SPText';
import SPTextField from '../../common/SPTextField';
import InputGroup from '../../common/InputGroup';
import InputRadio from '../../common/InputRadio';
import SPButton from '../../common/SPButton';
import Border from '../../common/Border';
import SPTextFieldInline from '../../common/SPTextFieldInline';
import SectionHeader from '../../common/SectionHeader';
import { loadCreatePoolOptions, createPool, updatePool, getGolfers } from '../../actions/pool';
import KeyboardHandler from '../KeyboardHandler';
import _ from 'underscore';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import ActivityIndicator from '../ActivityIndicator';
import moment from 'moment';
import AndroidPicker from '../AndroidPicker';
import Instabug from 'instabug-reactnative';

import LeagueView from './Steps/LeagueView';
import GameView from './Steps/GameView';
import GolferCountView from './Steps/GolferCountView';
import GolferGroupsView from './Steps/GolferGroupsView';
import WinnerCountView from './Steps/WinnerCountView';
import PoolStartView from './Steps/PoolStartView';
import PickCountView from './Steps/PickCountView';
import DetailsView from './Steps/DetailsView';

class CreatePool extends Component {

  constructor(props) {
    super(props);

    this.state = {
      sports: [],
      comingSoon: [],
      options: {
        name: null,
        description: null,
        league: null,
        tournament: null,
        start: null,
        game: 'Best 5 of 10',
        gameDescription: "",
        numWinners: 15,
        week: null,
        groups: [],
        rounds: []
      },
      golfers: [],
      routes: [],
      showAndroidPicker: false,
      selectedGolfer: null,
      poolsAvailable: false,
      availablePools: [],
      availableStartDates: [],
      allRounds: []
    };
  }

  componentDidMount() {
    this.navigator = this.props.navigator;

    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.navigator.pop();
      return true;
    });

    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Fetching pool options...'
    });

    loadCreatePoolOptions().then((json) => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      })

      // Add additional route for the 'confirm settings' step.
      var routes = [{
        index: 0,
        title: 'Select a sport.'
      }, {
        index: 1,
        title: 'Select a game.'
      }, {
        index: 5,
        title: 'Enter a pool name and description.'
      }];

      routes.push({index:6});

      var newState = {
        poolsAvailable: _.keys(json.available).length > 0,
        availablePools: _.chain(json.available).values().flatten().value(),
        comingSoon: json.comingSoon,
        routes: routes,
        golfers: json.golfers || [],
        options: {...this.state.options}
      }

      // Editing pool
      if (this.props.pool) {
        newState.options.name = this.props.pool.name;
        newState.options.description = this.props.pool.description;
        newState.options.numWinners = this.props.pool.numWinners;
        newState.options.groups = this.props.pool.groups.map(group => {
          return {
            _id: group.name,
            name: group.name,
            count: group.count
          };
        });
        newState.options.rounds = this.props.pool.rounds.map(round => {
          return {...round, basedOnSurvivors: round.numSurvivors ? true : false };
        });
        newState.options.game = this.props.pool.style;
        newState.options.start = this.props.pool.start;
        newState.options.league = this.props.pool.league.name;

        if (this.props.pool.style == 'Survivor') {
          var newRoutes = this.gameSpecificRoutes(this.props.pool.style).slice(1).concat(routes.slice(-2));
          var startIndex = newRoutes[0].index;
          newState.routes = newRoutes.map((route, idx) => {
            return { ...route, index: idx + startIndex }
          });
        } else {
          // Only allow changes to name and description
          if (this.props.pool.style == 'Best 5 of 10') {
            var newRoutes = [{
              index: 3,
              title: 'Confirm groups of golfers.'
            }, {
              index: 4,
              title: 'How many winners are in your pool?'
            }].concat(routes.slice(-2));
          }

          newState.routes = newRoutes;

          this.props.dispatch({
            type: 'SHOW_ACTIVITY_INDICATOR',
            text: 'Loading golfers...'
          });

          getGolfers(this.props.pool).then(golfers => {
            newState.golfers = _.flatten(this.props.pool.groups.map(group => {
              return group.golfers.map(golfer => {
                var g = _.find(golfers, _golfer => _golfer._id == golfer)
                return {
                  ...g,
                  group: group.name
                }
              });
            }))
          }).catch(err => {
            this.props.dispatch({
              type: 'HIDE_ACTIVITY_INDICATOR'
            })
            alert(err.message);
          })

        }

        this.setState(newState);
      } else {
        this.setState(newState);
      }
      
    }).catch((error) => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      })
      alert(error.message);
    });
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  render() {
    if (this.state.routes.length == 0) {
      return (
        <SPModal>
          <SPModalHeader />
          <SPModalBody />
          <ActivityIndicator
            animate={this.props.activityIndicator.show}
            text={this.props.activityIndicator.text}
          />
        </SPModal>
      );
    }

    return (
      <Navigator
        initialRoute={this.state.routes[0]}
        initialRouteStack={[this.state.routes[0]]}
        renderScene={(r,n) => this.renderScene(r,n)}
        configureScene={(route) => {
          return Navigator.SceneConfigs.HorizontalSwipeJump;
        }}
      />
    )
  }

  renderScene(route, navigator) {
    const isRoot = this.state.routes[0].index == route.index;
    const isLast = route.index == _.last(this.state.routes).index;

    // Left navigation item
    const leftTitle = isRoot ? 'Close' : 'Back';
    const leftPress = isRoot ? () => this.props.navigator.pop() : () => navigator.pop();
    this.navigator = isRoot ? this.props.navigator : navigator;

    const leftButton = (
      <View style={styles.leftComponent}>
      <TouchableOpacity onPress={leftPress}>
        <SPText style={{color:'#666666'}}>{leftTitle}</SPText>
      </TouchableOpacity>
      </View>
    );

    // Right navigation item
    const rightTitle = !this.state.poolsAvailable && !this.props.pool ? "" : isLast ? this.props.pool ? 'Update' : 'Create' : 'Next';
    const rightPress = !this.state.poolsAvailable && !this.props.pool ? () => {} : isLast ? this.props.pool ? () => this.updatePool() : () => this.createPool() : () => this.nextStep(route.index, navigator);

    const optionTitle = isLast ? this.props.pool ? 'Review your settings before confirming changes' : "Confirm all your settings before creating the pool." : route.title;

    const stepTitle = isLast ? this.props.pool ? 'All active players will be notified of the changes' : 'Final Step' : this.props.pool ? "" : `Step ${route.index + 1} of ${this.state.routes.length}`;

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton title={leftTitle} onPress={leftPress} />}
          title={this.props.pool ? 'Edit Pool' : 'Create Pool'}
          rightComponent={<SPModalButton title={rightTitle} onPress={rightPress} />}
        >
          <View style={{ padding: 20 }}>
            <Text styleName="bold white center" style={styles.optionTitle}>
              {optionTitle}
            </Text>
            <Text styleName="translucent center" style={styles.stepTitle}>
              {stepTitle}
            </Text>
          </View>
        </SPModalHeader>
        <SPModalBody>
        {this.componentForRoute(route)}
        </SPModalBody>

        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />

      </SPModal>
    )
  }

  componentForRoute(route) {

    if (route.index == 0) {
      return (
        <LeagueView
          available={this.state.availablePools}
          comingSoon={this.state.comingSoon}
          isSelected={(object) => {
            var match = this.state.options.league == object.league;
            if (object.tournament) {
              match = match && this.state.options.tournament == object.tournament.name;
            }

            return match;
          }}
          onSelection={(object, selected) => {
            var options = {
              league: selected ? null : object.league,
              tournament: null,
              groups: [],
              game: selected ? null : object.style.name,
              gameDescription: selected ? null : object.style.description,
            };

            var newState = {};

            // For PGA pools
            if (object.tournament) {
              options.tournament = selected ? null : object.tournament.name;
              options.numWinners = object.tournament.numWinners;
              options.groups = selected ? [] : object.tournament.groups;
              options.start =  moment(object.tournament.start);

              if (object.tournament.groups) {
                newState.golfers = [];
                if (!selected) {
                  newState.golfers = _.flatten(object.tournament.groups.map(group => {
                    return group.golfers.map(golfer => {
                      return {
                        ...golfer,
                        group: group._id
                      }
                    });
                  }))
                }
              }
            }

            // A league has been selected.
            if (options.league) {
              var selectedAvailablePool = _.findWhere(this.state.availablePools, { league: options.league });

              // Add available start dates
              if (selectedAvailablePool && selectedAvailablePool.startDates) {
                newState.availableStartDates = selectedAvailablePool.startDates;
              }

              // Add rounds
              if (selectedAvailablePool) {
                options.rounds = selectedAvailablePool.rounds;
                newState.allRounds = options.rounds;
              }
            }

            newState.options = {...this.state.options, ...options};

            // Add game style specific routes
            var routes = [...this.state.routes];
            routes = routes.slice(0, 3)

            if (!selected) {
              routes.splice.apply(
                routes, [2, 0].concat(
                  this.gameSpecificRoutes(options.game)
                )
              );
            }

            // Add confirm settings
            routes.push({
              index: routes.length
            });

            newState.routes = routes.map((route, idx) => {
              return {...route, index: idx}
            });

            this.setState(newState);
          }}
        />
      );
    }

    if (route.index == 1) {
      return (
        <GameView
          title={this.state.options.game}
          description={this.state.options.gameDescription}
        />
      )
    }

    if (route.index == 2 && this.state.options.game == 'Survivor') {
      return (
        <PoolStartView
          dates={this.state.availableStartDates}
          isSelected={(date) => {
            return this.state.options.start == date
          }}
          onSelection={(date, week, selected) => {
            const newOptions = {
              ...this.state.options,
              ...{
                start: selected ? null : date.date,
                week: selected ? null : week
              }
            };

            if (selected) {
              newOptions.rounds = [];
            } else {
              var index = _.findIndex(this.state.allRounds, round => round.start == date.date);
              if (index) {
                newOptions.rounds = this.state.allRounds.slice(index);
              }
            }

            this.setState({
              options: newOptions
            });
          }}
        />
      )
    }

    if (route.index == 2) {
      return (
        <GolferCountView
          groups={this.state.options.groups}
          onChange={(option, text) => {
            const newState = {
              options: {
                ...this.state.options,
                groups: this.state.options.groups.map(o => {
                  if (o._id == option._id) {
                    return {...option, count: text};
                  }
                  return o;
                })
              }
            };
            this.setState(newState);
          }}
        />
      )
    }

    if (route.index == 3 && this.state.options.game == 'Survivor') {
      return (
        <PickCountView
          rounds={this.state.options.rounds}
          onChange={(round, idx) => {
            this.setState({
              options: {
                ...this.state.options,
                rounds: this.state.options.rounds.map((r, i) => {
                  return i == idx ? round : r;
                })
              }
            })
          }}
        />
      )
    }

    if (route.index == 3) {
      return (
        <GolferGroupsView
          golfers={this.state.golfers}
          groups={this.state.options.groups}
          onSelect={(group, selectedGolfer) => {
            const newState = {
              golfers: this.state.golfers.map(p => {
                if (p._id == selectedGolfer._id) {
                  return { ...p, group: group };
                }

                return p;
              })
            };
            this.setState(newState);
          }}
        />
      );
    }

    if (this.state.options.game == 'Best 5 of 10' && route.index == 4) {
      return (
        <WinnerCountView
          numWinners={this.state.options.numWinners}
          onChange={(text) => {
            this.setState({
              options: {
                ...this.state.options,
                numWinners: text
              }
            });
          }}
        />
      );
    }

    if ((this.state.options.game == 'Best 5 of 10' && route.index == 5) || route.index == 4) {
      return (
        <DetailsView
          name={this.state.options.name}
          description={this.state.options.description}
          onNameChange={(text) => {
            this.setState({
              options: {...this.state.options, name: text}
            });
          }}
          onDescriptionChange={(text) => {
            this.setState({
              options: {...this.state.options, description: text}
            });
          }}
        />
      );
    }

    return (
      <ScrollView>
        <SPTextFieldInline label="Sport" value={this.state.options.league} editable={false} />
        <SPTextFieldInline label="Game" value={this.state.options.game} editable={false} />
        <SPTextFieldInline label="Starts" value={moment(this.state.options.start).format('ddd, MMMM Do')} editable={false} />
        {this.state.options.groups.map((option, idx) => {
          return (
            <SPTextFieldInline
              key={`group${idx}`}
              label={option.name}
              value={`${option.count} ${option.count == 1 ? "Golfer" : "Golfers"}`}
              keyboardType={"numeric"}
              editable={false}
            />
          )
        })}

        <SPTextField label="Pool Name" value={this.state.options.name || ""} editable={false} />
        <SPTextField label="Pool Description" value={this.state.options.description || ""} editable={false} multiline={true} />
      </ScrollView>
    );
  }

  gameSpecificRoutes(game) {
    if (game == 'Best 5 of 10') {
      return [{
        index: 2,
        title: 'How many golfers should players pick per group?'
      }, {
        index: 3,
        title: 'Confirm groups of golfers.'
      }, {
        index: 4,
        title: 'How many winners are in your pool?'
      }];
    }

    if (game == 'Survivor') {
      return [{
        index: 2,
        title: 'Select start date.'
      }, {
        index: 3,
        title: 'Confirm picks per week.'
      }];
    }

    return [];
  }

  createPool() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Creating pool...'
    });

    createPool(this.transformOptionsToParams(this.state.options), this.props.auth.token)
      .then(pool => {
        this.props.dispatch({
          type: 'ADD_POOL',
          pool: pool
        });

        this.props.navigator.pop();

        DeviceEventEmitter.emit('new pool added', pool);
      })
      .catch(err => {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR '});
        alert(err.message);
      });
  }

  updatePool() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Updating pool...'
    });

    updatePool(this.props.pool._id, this.transformOptionsToParams(this.state.options), this.props.auth.token)
      .then(pool => {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR '});

        this.props.dispatch({
          type: 'UPDATE_POOL',
          pool: pool
        });

        this.props.navigator.pop();
      })
      .catch(err => {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR '});
        alert(err.message)
      });
  }

  transformOptionsToParams(options) {
    return {
      league: options.league,
      game: options.game,
      name: options.name,
      description: options.description,
      start: options.start,
      week: options.week,
      groups: options.groups.map(group => {
        return {
          ...group, ...{
            count: parseInt(group.count),
            golfers: this.state.golfers.filter(golfer => {
              return golfer.group == group._id
            })
          }
        }
      }),
      rounds: options.rounds ? options.rounds.map(round => {
        return {
          ...round, count: Number(round.count)
        }
      }) : [],
      tournament: options.tournament,
      numWinners: options.numWinners
    };
  }

  nextStep(index: number, navigator) {
    const err = this.validateStep(index);
    if (err) {
      alert(err.message);
    } else {
      navigator.push(
        _.last(this.state.routes.filter(r => r.index == (index+1)))
      );
    }
  }

  validateStep(index: number): error {
    var err;

    switch (index) {
      case 0:
        if (!this.state.options.league) { err = new Error('Select a league.'); }
        break;
      case 1:
        if (!this.state.options.game) { err = new Error('Select a game.'); }
        break;
      case 2:
        if (this.state.options.game == 'Survivor') {
          if (!this.state.options.start) {
            err = new Error('Please select a start date for the pool.');
          }
          break;
        } else if (this.state.options.game == 'Best 5 of 10') {
          const count = _.reduce(this.state.options.groups, (memo, group) => memo + parseInt(group.count) || 0, 0);
          if (count != 10) {
            err = new Error('The total number of golfers should equal 10.')
          }
        }

        break;
      case 4:
        if (this.state.options.game == 'Survivor' && !this.state.options.name) { err = new Error('Enter a pool name.') }
        if (!parseInt(this.state.options.numWinners)) { err = new Error('Enter the number of winners') }
        break;
      case 5:
        if (!this.state.options.name) { err = new Error('Enter a pool name.') }
        break;
      default:
        break;
    }

    return err;
  }

}

const styles = StyleSheet.create({
  componentsContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  component: {
    height: 24,
    marginBottom: -8,
    alignSelf: 'flex-end',
    flex: 1,
  },
  leftComponent: {
    alignItems: 'flex-start',
    flex: 1,
  },
  centerComponent: {
    alignItems: 'center',
    flex: 1,
  },
  rightComponent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  optionTitle: {
    fontSize: 22
  },
  stepTitle: {
    fontSize: 16,
    marginTop: 8
  },
  inputTitle: {
    color: '#999',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  inputDescription: {
    color: '#999',
    paddingHorizontal: 20,
    paddingBottom: 20
  }
});

export default connect((store) => {
  return store;
})(CreatePool);
