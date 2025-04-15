import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZFHNYBrsr4v9mbYw_srM0779NsYHHuWM",
  authDomain: "gas-agency-system-121f3.firebaseapp.com",
  projectId: "gas-agency-system-121f3",
  storageBucket: "gas-agency-system-121f3.appspot.com",
  messagingSenderId: "1081165744801",
  appId: "1:1081165744801:web:66b853acba5ed6e06f7ee0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
        });
        alert("Registered successfully!");
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error(err);
        alert(`Registration failed: ${err.message}`);
      }
    });
}

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      alert(`Login failed: ${err.message}`);
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const isDashboard = window.location.pathname.includes("dashboard.html");
  const isAdmin = window.location.pathname.includes("admin.html");

  if (user && isDashboard) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      document.getElementById("username").textContent = userDoc.data().name;

      const q = query(collection(db, "bookings"), where("uid", "==", user.uid));
      const bookingsSnap = await getDocs(q);
      const list = document.getElementById("bookingsList");

      bookingsSnap.forEach((docSnap) => {
        const li = document.createElement("li");
        li.textContent = `Booking ID: ${docSnap.id} | Date: ${
          docSnap.data().date
        }`;
        list.appendChild(li);
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  }

  if (user && isAdmin) {
    const list = document.getElementById("allBookings");
    try {
      const bookingsSnap = await getDocs(collection(db, "bookings"));

      for (const docSnap of bookingsSnap.docs) {
        const booking = docSnap.data();
        const userDoc = await getDoc(doc(db, "users", booking.uid));

        const li = document.createElement("li");
        li.textContent = `User: ${userDoc.data().name}, Booking Date: ${
          booking.date
        }`;
        list.appendChild(li);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  }
});

const logoutBtn = document.getElementById("logoutBtn");

document.addEventListener("DOMContentLoaded", () => {
  const allBookingsBtn = document.getElementById("Allbookings");

  if (allBookingsBtn) {
    allBookingsBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to view bookings.");
        return;
      }

      try {
        const q = query(
          collection(db, "bookings"),
          where("uid", "==", user.uid)
        );
        const bookingsSnap = await getDocs(q);

        if (bookingsSnap.empty) {
          alert("No bookings found.");
          return;
        }

        let bookingsList = "Your Bookings:\n";
        bookingsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          bookingsList += `• ID: ${docSnap.id} | Date: ${data.date}\n`;
        });

        alert(bookingsList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        alert("Failed to fetch bookings.");
      }
    });
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      window.location.href = "index.html"; //
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Try again.");
    }
  });
}

window.bookGas = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const booking = {
        uid: user.uid,
        date: new Date().toLocaleString(),
      };
      await addDoc(collection(db, "bookings"), booking);
      alert("Gas cylinder booked successfully!");
      location.reload();
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book gas cylinder.");
    }
  }
};
