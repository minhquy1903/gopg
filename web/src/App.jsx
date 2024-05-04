import MyCustomMonaco from "./components/Editor";
import GlobalContextProvider from "./context/GlobalContext";
import Header from "./layouts/Header";

const App = () => {
  let editorRef = {};

  return (
    <GlobalContextProvider>
      <Header />
      <MyCustomMonaco
        ref={<div></div>}
        options={{
          theme: "vs-dark",
          minimap: {
            enabled: true,
          },
        }}
      />
    </GlobalContextProvider>
  );
};

export default App;
