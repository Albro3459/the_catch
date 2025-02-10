# Setting up environment

Clone the repository wherever you want to keep it

`cd the-catch` to change into the app directory
`npm install` this checks package-lock.json for any dependicies, and downloads them.
For now, this will install react native, among other things. Its not wise to push the dependicies to github because they may be quite large. Make sure node-modules is always include in your `.gitignore` so they dont get pushed (it should be set automatically).

Once everything is installed, you can do `npm start` or `expo start`(i think) and it will start the program.
If you have an iphone, download the expo go app and scan the QR from the **camera** app.
If you have an android, still download expo go, but there should be a camera inside the expo go app to scan the qr code.

If you have a mac, you can also press i while in the terminal to open up an IOS simulator (assuming you have xcode installed).

I have very recently learned that expo now includes its own navigaton library (expo-router). We can refer to this documentation when we are doing screen switches n stuff.
https://docs.expo.dev/router/introduction/

If you make a componenet, store it in the `the-catch/components` folder.

When styling your components and screens, React native **does not** use css. They have their own style sheet.
Documentation: https://reactnative.dev/docs/style
If you can find better documentation than this, please share :D

To compare native to regular web dev,

> Everything in react native is a flexbox (heres a guide for flexboxes that helped me https://flexboxfroggy.com/)
> Views are _almost_ equivalent to divs

Quirks about react native:
If you want to use basic react native components, you **MUST** import them
for example, if you want a simple view with a text box inside, you must

```tsx
import { View, Text } from "react-native";

export default function RandomComponent() {
  return (
    <View>
      <Text> Hey! </Text>
    </View>
  );
}
```

In react and react native, components are _usually_ functions. Follow the above template for RandomComponent() if you are afraid.

When returning something for a componenet, there must be **ONE** parent element. If you dont want to use an element, you can use a fragment

### Not legal - Two parent elements

```tsx
import { View, Text } from "react-native";

export default function RandomComponent() {
  return (
    <View>
      <Text> Hey! </Text>
    </View>
    <View>
      <Text> Hello! </Text>
    </View>
  );
}
```

### Legal - Component has only 1 parent element (either a fragment or a view)

```tsx
import { View, Text } from "react-native";

export default function RandomComponent() {
  return (
   <> {/* could also be a <View>*/}
    <View>
      <Text> Hey! </Text>
    </View>
    <View>
      <Text> Hello! </Text>
    </View>
   </> {/*Could also be a </View>*/}
  );
}
```

Within the return statement only, if you need to use javascript it **MUST** be wrapped in curly braces.

Here is an example of using JS to map a list of elements into `<Text>` Elements

```tsx
import { View, Text } from "react-native";

const listOfText = ["hey", "hi", "hello"];

export default function RandomComponent() {
  return (
    <View>
      {listOfText.map((element, index) => {
        return <Text key={index}>{element}</Text>; //If you are mapping elements, give them a key for efficiency purposes.
      })}
    </View>
  );
}
```
