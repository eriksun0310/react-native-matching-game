import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Card from "./Card";
import { Component } from "react";

class App extends Component {
  state = {
    cardSymbols: ["🍇", "🍈", "🍉", "🍊", "🍎", "🍓", "🍍", "🍌"],
    cardSymbolsIsRand: [], //儲存打亂的emoji 的順序arr
    isOpen: [], //紀錄 card 是否掀開

    firstPickedIndex: null, // 選擇第一張card 的位置
    secondPickedIndex: null, // 選擇第二張card 的位置
    steps: 0, // 計算翻開次數
    isEnded: false, // 判斷遊戲是否結束
  };

  initGame = () => {
    // 8*2 = 16個emoji
    let newCardsSymbols = [
      ...this.state.cardSymbols,
      ...this.state.cardSymbols,
    ];
    //打亂emoji 的順序arr
    let cardSymbolsIsRand = this.shuffleArray(newCardsSymbols);

    let isOpen = [];
    for (let i = 0; i < newCardsSymbols.length; i++) {
      isOpen.push(false);
    }

    //更新狀態
    this.setState({
      cardSymbolsIsRand,
      isOpen,
    });
  };

  componentDidMount() {
    this.initGame();
  }

  //打亂arr的順序
  shuffleArray = (arr) => {
    const newArr = arr.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    }
    return newArr;
  };

  //點擊card, 要掀開的邏輯
  cardPressHandler = (index) => {
    let isOpen = [...this.state.isOpen];

    if (isOpen[index]) {
      return;
    }

    isOpen[index] = true;

    //正在選擇第一個card
    if (
      this.state.firstPickedIndex == null &&
      this.state.secondPickedIndex == null
    ) {
      this.setState({
        isOpen,
        firstPickedIndex: index,
      });
      // 正在選擇第二個card
    } else if (
      this.state.firstPickedIndex != null &&
      this.state.secondPickedIndex == null
    ) {
      this.setState({
        isOpen,
        secondPickedIndex: index,
      });
    }

    this.setState({
      isOpen,
      steps: this.state.steps + 1,
    });
  };

  calculateGameResult = () => {
    if (
      this.state.firstPickedIndex != null &&
      this.state.secondPickedIndex != null
    ) {
      if (this.state.cardSymbolsIsRand.length > 0) {
        // 所有已開的card
        let totalOpens = this.state.isOpen?.filter((isOpen) => isOpen);

        //遊戲結束
        if (totalOpens.length === this.state.cardSymbolsIsRand.length) {
          this.setState({
            isEnded: true,
          });
          return;
        }
      }

      //第一個emoji
      let firstSymbol =
        this.state.cardSymbolsIsRand[this.state.firstPickedIndex];
      //第二個emoji
      let secondSymbol =
        this.state.cardSymbolsIsRand[this.state.secondPickedIndex];

      // 翻開的card 不相同
      if (firstSymbol != secondSymbol) {
        setTimeout(() => {
          let isOpen = [...this.state.isOpen];
          //把card 翻面
          isOpen[this.state.firstPickedIndex] = false;
          isOpen[this.state.secondPickedIndex] = false;

          this.setState({
            firstPickedIndex: null,
            secondPickedIndex: null,
            isOpen,
          });
        }, 1000);

        // 翻開的card 相同
      } else {
        this.setState({
          firstPickedIndex: null,
          secondPickedIndex: null,
        });
      }
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.secondPickedIndex != this.state.secondPickedIndex) {
      this.calculateGameResult();
    }
  }

  resetGame = () => {
    this.initGame();
    this.setState({
      firstPickedIndex: null,
      secondPickedIndex: null,
      steps: 0,
      isEnded: false,
    });
  };

  render() {
    return (
      <>
        <StatusBar />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.heading}>Matching Game</Text>
          </View>
          <View style={styles.main}>
            <View style={styles.gameBoard}>
              {this.state.cardSymbolsIsRand.map((symbol, index) => (
                <Card
                  key={index}
                  onPress={() => this.cardPressHandler(index)}
                  style={styles.button}
                  fontSize={30}
                  title={symbol}
                  cover="❓"
                  isShow={this.state.isOpen[index]}
                />
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {this.state.isEnded
                ? `Congrats! You have completed in ${this.state.steps} steps.`
                : `You have tried ${this.state.steps} time(s).`}
            </Text>
            {this.state.isEnded ? (
              <TouchableOpacity
                onPress={this.resetGame}
                style={styles.tryAgainButton}
              >
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "yellow",
  },
  header: {
    flex: 1,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  main: {
    flex: 3,
    backgroundColor: "#fff",
  },
  footer: {
    flex: 1,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  gameBoard: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  button: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    margin: (Dimensions.get("window").width - 48 * 4) / (5 * 2),
    border: "1px solid #a7a7a7",
  },
  buttonText: {
    fontSize: 30,
  },
  tryAgainButton: {
    backgroundColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginTop: 20,
  },
  tryAgainButtonText: {
    fontSize: 18,
  },
});

export default App;
