// Importer la table de correspondance AZERTY et les traductions
import { keycodeAZERTYmap } from './keycodeAZERTY.js';

let assignedKeyCode = null;
let isAZERTY = true; // Par défaut, on considère AZERTY
const macroSequence = [];
let translations = {}; // Stocker les traductions

// Fonction pour charger la langue sélectionnée
async function loadLanguage(lang) {
  try {
    const response = await fetch(`assets/lang/${lang}.json`);
    
    if (!response.ok) {
      throw new Error(`Could not load ${lang}.json`);
    }

    translations = await response.json();

    // Mise à jour des éléments de l'interface avec les traductions
    document.getElementById('title').textContent = translations['title'];
    document.getElementById('sortsLabel').textContent = translations['sorts'];
    document.getElementById('itemsLabel').textContent = translations['items'];
    document.getElementById('generateMacro').textContent = translations['generate_macro'];
    document.getElementById('selectKeyboard').textContent = translations['keyboard_layout'];
    document.getElementById('assignKey').textContent = translations['assign_key'];
    document.getElementById('languageSelectorLabel').textContent = translations['language_selector'];
    document.getElementById('pressKey').placeholder = translations['press_key'];
  } catch (error) {
    console.error("Error loading language file:", error);
  }
}

// Fonction pour expliquer la macro créée
function generateMacroExplanation(macro) {
    const actions = macro.split(';');
    let explanation = [];
  
    // Parcourt chaque action et utilise les traductions disponibles
    actions.forEach(action => {
      const cleanAction = action.trim().replace(/^\+|-$/, '');  // Supprime les signes +/-
      
      if (translations['actions'][action.trim()]) {
        explanation.push(translations['actions'][action.trim()]);
      } else if (translations['actions'][cleanAction]) {
        explanation.push(translations['actions'][cleanAction]);
      }
    });
  
    // Retourne l'explication sous forme de texte
    return explanation.length > 0 ? explanation.join(' → ') : "No explanation available";
}
  
// Détection automatique de la langue
document.addEventListener('DOMContentLoaded', () => {
  const systemLang = navigator.language.slice(0, 2); // ex: 'fr' ou 'en'
  loadLanguage(systemLang);
  document.getElementById('languageSelector').value = systemLang;
});

// Fonction pour capturer la touche appuyée
function captureKeyCode(event) {
  const keyPressed = event.key;  // Utiliser event.key au lieu de event.code

  // Si le clavier est en AZERTY, on utilise les scancodes
  if (isAZERTY) {
    if (keycodeAZERTYmap[keyPressed.toUpperCase()] !== undefined) {
      assignedKeyCode = `scancode${keycodeAZERTYmap[keyPressed.toUpperCase()]}`;
      document.getElementById('pressKey').value = event.key; // Afficher la touche sélectionnée
      document.getElementById('assignedKeyOutput').textContent = `Assigned key: ${event.key}`; // Met à jour le champ 'assignedKeyOutput'
    } else {
      document.getElementById('statusMessage').textContent = translations['key_not_mapped'];
    }
  } else {
    // Pour QWERTY, on utilise directement les lettres et chiffres
    assignedKeyCode = keyPressed.toLowerCase(); // Utiliser directement la touche
    document.getElementById('pressKey').value = event.key;  // Afficher la touche sélectionnée
    document.getElementById('assignedKeyOutput').textContent = `Assigned key: ${event.key}`; // Met à jour le champ 'assignedKeyOutput'
  }
}

// Fonction pour réinitialiser l'attribution de la touche après la génération de la macro
function resetKeyBinding() {
  assignedKeyCode = null;
  document.getElementById('pressKey').value = ''; // Réinitialise le champ de touche
  document.getElementById('assignedKeyOutput').textContent = ''; // Réinitialise l'affichage de la touche
  document.getElementById('pressKey').focus();  // Redonner le focus au champ
}

// Copie la macro dans le presse-papiers
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Afficher un message visuel sans utiliser alert()
    document.getElementById('statusMessage').textContent = translations['macro_copied'];
  }).catch(err => {
    console.error('Failed to copy to clipboard', err);
    document.getElementById('statusMessage').textContent = translations['macro_copy_fail'];
  });
}

// Ajout des actions aux macros lors du clic sur les icônes
const icons = document.querySelectorAll('.icon');
icons.forEach(icon => {
  icon.addEventListener('click', (event) => {
    const id = event.currentTarget.id; // Utiliser currentTarget pour capter le bon div

    event.currentTarget.classList.toggle('selected'); // Gérer la sélection

    let action = '';
    switch (id) {
      case 'sort1': action = '+in_ability1;+attack;-in_ability1;-attack'; break;
      case 'sort2': action = '+in_ability2;+attack;-in_ability2;-attack'; break;
      case 'sort3': action = '+in_ability3;+attack;-in_ability3;-attack'; break;
      case 'sort4': action = '+in_ability4;+attack;-in_ability4;-attack'; break;
      case 'item1': action = '+in_item1;+attack;-in_item1;-attack'; break;
      case 'item2': action = '+in_item2;+attack;-in_item2;-attack'; break;
      case 'item3': action = '+in_item3;+attack;-in_item3;-attack'; break;
      case 'item4': action = '+in_item4;+attack;-in_item4;-attack'; break;
    }

    if (event.currentTarget.classList.contains('selected')) {
      macroSequence.push(action);
    } else {
      const index = macroSequence.indexOf(action);
      if (index > -1) {
        macroSequence.splice(index, 1);
      }
    }

    renderMacroSequence(); // Mets à jour l'affichage de la macro générée
  });
});


// Fonction pour afficher la séquence de la macro dans la sortie
function renderMacroSequence() {
  document.getElementById('macroOutput').textContent = macroSequence.join(';');
}

// Ajouter l'écouteur d'événements pour capturer la touche
document.getElementById('pressKey').addEventListener('focus', () => {
  document.addEventListener('keydown', captureKeyCode);
});

// Retirer l'écouteur pour éviter des écoutes multiples
document.getElementById('pressKey').addEventListener('blur', () => {
  document.removeEventListener('keydown', captureKeyCode);
});

// Gestion du changement de disposition du clavier
document.getElementById('keyboardLayout').addEventListener('change', (event) => {
  isAZERTY = event.target.value === 'azerty';  // On change selon le choix de l'utilisateur
});

// Fonction pour traduire un scancode en touche lisible
function translateScancode(scancode) {
  const scancodeNumber = scancode.replace('scancode', '');
  return keycodeAZERTYmap[scancodeNumber] || scancode;
}

// Génération de la macro avec le scancode ou la lettre
document.getElementById('generateMacro').addEventListener('click', () => {
    if (assignedKeyCode) {
      const macroCommand = `bind ${assignedKeyCode} "${macroSequence.join(';')}"`;
      
      // Copie la macro dans le presse-papiers
      copyToClipboard(macroCommand);
  
      // Affiche la macro dans la sortie
      document.getElementById('macroOutput').textContent = macroCommand;
  
      // Génère et affiche une explication de la macro avec la touche bindée
      const explanation = generateMacroExplanation(macroSequence.join(';'));
  
      // Vérifier si une touche est assignée et la traduire si c'est un scancode
      const keyDescription = assignedKeyCode.startsWith('scancode') 
        ? `On pressing the key <strong>${translateScancode(assignedKeyCode)}</strong>, `
        : `On pressing the key <strong>${assignedKeyCode}</strong>, `;
  
      document.getElementById('macroExplanation').innerHTML = `<strong>${translations['macro_summary']}</strong><br>${keyDescription}${explanation}`;
  
      // Affiche le tutoriel d'application de la macro
      document.getElementById('tutorial').innerHTML = `
        <p>${translations['tutorial_instructions']}</p>
        <ul>
          <li>${translations['tutorial_steps'][0]}</li>
          <li>${translations['tutorial_steps'][1]}</li>
          <li>${translations['tutorial_steps'][2]}</li>
        </ul>
      `;
      
      // Réinitialiser après la génération de la macro
      resetKeyBinding();
    } else {
      document.getElementById('statusMessage').textContent = translations['assign_key_before_macro'];
    }
  });
  
// Gestion du changement de langue
document.getElementById('languageSelector').addEventListener('change', (event) => {
  loadLanguage(event.target.value);
});
``
