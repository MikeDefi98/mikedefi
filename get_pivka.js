const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://employee-reports-3607c-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const pivkaRef = ref(db, 'contacts/Pivka');

get(pivkaRef).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(JSON.stringify(snapshot.val(), null, 2));
  } else {
    console.log("No data available");
  }
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
