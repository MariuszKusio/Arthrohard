// Blur
const screenBlur = document.querySelector(".screenBlur");

// Pobiernia przycisków
const aboutButton = document.getElementById("aboutButton");
const productsButton = document.getElementById("productsButton");
const compositionButton = document.getElementById("compositionButton");
const mobileMenuHamburgerButton = document.querySelector(
  ".mobileButtonContainer"
);
const mobileMenuButtonsContainer = document.querySelector(
  ".mobileMenuButtonsContainer"
);

// Funkcja ScrollToSection i nasłuchiwanie przycisków menu

// Obserwowanie sekcji
const menuButtons = document.querySelectorAll(".menuButton");
const sections = document.querySelectorAll(".section");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.id === "section0") {
          // Jeśli to jest #section0, usuń klasy 'active' z wszystkich przycisków
          menuButtons.forEach((button) => button.classList.remove("active"));
        } else {
          // Usuń klasy 'active' z innych przycisków
          //   console.log(`jestem na sekcji: ${entry.target.id}`);
          menuButtons.forEach((button) => button.classList.remove("active"));
          // Dodaj klasę 'active' do przycisku odpowiadającego aktualnej sekcji
          const activeButton = document.querySelector(
            `.menuButton[data-section="${entry.target.id}"]`
          );
          if (activeButton) {
            activeButton.classList.add("active");
          }
        }
      }
    });
  },
  {
    threshold: 0.4,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSection = document.getElementById(button.dataset.section);
    targetSection.scrollIntoView({ behavior: "smooth" });
  });
});

// Funkcje Menu
function setActiveToMobileMenu() {}

mobileMenuHamburgerButton.addEventListener("click", () => {
  mobileMenuButtonsContainer.classList.toggle("active");
  screenBlur.classList.toggle("active");
});

// Efekt parallaxy

// Pobieranie parallaxy img
const parallaxImage = document.getElementById("parallaxImage");
let imageVisible = false;

// Sprawdzenie, czy obraz jest w połowie widoczny
const parallaxObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        imageVisible = true;
      } else {
        imageVisible = false;
      }
    });
  },
  { threshold: [0.5] }
);

parallaxObserver.observe(parallaxImage);

// Obsługa efektu parallax przy przewijaniu
window.addEventListener("scroll", () => {
  if (imageVisible) {
    const rect = parallaxImage.getBoundingClientRect();
    const offset = rect.top - window.innerHeight / 2; // Odległość środka obrazu od środka ekranu
    const translateY = offset * 0.03; // Skaluj efekt (np. 20% przesunięcia)
    parallaxImage.style.transform = `translateY(${50 + translateY}px)`;
  }
});

// Funkcje dla galerii prodktów

// Tworzenie elementu li (produkt)
function createListItem(dataText, paragraphText, productId) {
  // Tworzenie elementu <li>
  const li = document.createElement("li");
  li.classList.add("product");
  li.setAttribute("data-text", dataText);
  li.setAttribute("id", productId);

  // Tworzenie elementu <p>
  const p = document.createElement("p");
  p.textContent = paragraphText;

  // Dodanie <p> do <li>
  li.appendChild(p);

  // nasluchiwanie elementu
  li.addEventListener("click", () => {
    showPopup(dataText, paragraphText, productId);
  });

  return li;
}

// Pobieramy kontener ul dla elementów li
const ul = document.querySelector(".productList");

// Pobieranie danej wartości z select
const productNumberSelector = document.getElementById("productsNumber");

document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1; // Aktualny numer strony
  let pageSize = parseInt(productNumberSelector.value, 10); // Rozmiar strony
  let isLoading = false;
  const observerElement = document.getElementById("observerElement");
  let loadedItems = 0; // Liczba załadowanych elementów
  const batchSize = 10; // Ilość ładowanych produktów

  function fetchData(page) {
    if (loadedItems >= pageSize) return;

    isLoading = true;
    const size = Math.min(batchSize, pageSize - loadedItems);

    fetch(
      `https://brandstestowy.smallhost.pl/api/random?pageNumber=${page}&pageSize=${size}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const fetchedItems = data.data || [];

        fetchedItems.forEach((item, i) => {
          const listItem = createListItem(
            item.text,
            `ID: ${item.id}`,
            `product${loadedItems + i}`
          );
          ul.appendChild(listItem);
        });

        loadedItems += fetchedItems.length;
        isLoading = false;

        // Sprawdzenie, czy załadowano już wszystkie elementy
        if (loadedItems >= pageSize) {
          observer.disconnect();
          console.log("Załadowano wszystkie produkty. Obserwacja zakończona.");
        }
      })
      .catch((error) => {
        console.error("Wystąpił problem z pobieraniem danych:", error);
        isLoading = false;
      });
  }

  // Resetowanie danych przy zmianie liczby produktów
  productNumberSelector.addEventListener("change", () => {
    const newPageSize = parseInt(productNumberSelector.value, 10);
    if (!isNaN(newPageSize) && newPageSize > 0) {
      pageSize = newPageSize;
      resetData();
    } else {
      console.error("Nieprawidłowy rozmiar strony.");
    }
  });

  function resetData() {
    loadedItems = 0;
    currentPage = 1;
    ul.innerHTML = ""; // Usunięcie poprzednich elementów
    observer.observe(observerElement);
    fetchData(currentPage); // Wczytaj dane od nowa
  }

  // Tworzenie Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading) {
          currentPage += 1;
          fetchData(currentPage);
        }
      });
    },
    {
      rootMargin: "100px",
    }
  );

  // Obserwowanie ukrytego elementu
  observer.observe(observerElement);

  // Wczytaj pierwszą stronę przy starcie
  fetchData(currentPage);
});

// Pop-up

function showPopup(dataText, paragraphText, productId) {
  // Stwórz popup
  const popup = document.createElement("div");
  popup.classList.add("popupModal");

  // Zawartość popup
  popup.innerHTML = `
      <div class="popupContent">
        <div class="flexPopupContainer">
        <p>${paragraphText}</p>
        <button class="closePopup">X</button>
        </div>
        <p>Nazwa: ${dataText}</p>
        <p>Wartość:</p>
      </div>
    `;

  // Dodaj modal do dokumentu
  document.body.appendChild(popup);

  // Zamknięcie popupu
  popup.querySelector(".closePopup").addEventListener("click", () => {
    popup.remove();
  });

  // Zamknięcie pop-upa po kliknięciu poza obszar zawartości
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.remove();
    }
  });
}
