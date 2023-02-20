// Global variables
let savedSnippets = [];
let snippetToUpdate = null;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const snippetList = document.getElementById('snippet-list');

  window.addEventListener('hashchange', function() {
    const snippetList = document.getElementById('snippet-list');
    const tag = window.location.hash.substring(1);
    filterByTag(savedSnippets, tag, snippetList);
  });
  
  // Get saved snippets from localStorage or create an empty array
  savedSnippets = JSON.parse(localStorage.getItem('snippets')) || [];

  // Display saved snippets
  displaySnippets(savedSnippets, snippetList);

  document.getElementById('search-term').addEventListener('input', function(event) {
    // Search snippets as the user types
    const searchTerm = event.target.value.trim();
    const filteredSnippets = searchSnippets(savedSnippets, searchTerm);
    displaySnippets(filteredSnippets, snippetList);
  });

  document.getElementById('snippet-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const snippetList = document.getElementById('snippet-list');
    addSnippet(snippetList); // Call the addSnippet function
  });
}); 

// Helper functions
function filterByTag(snippets, tag) {
  const filteredSnippets = snippets.filter(function(snippet) {
    return snippet.tags.split(',').map(t => t.trim()).includes(tag);
  });
  return filteredSnippets;
}



function showTagResults(snippets, tag, snippetList) {
  const tagResultsHeader = document.createElement('h3');
  tagResultsHeader.textContent = `Showing results with the tag "${tag}".`;
  tagResultsHeader.id = 'tag-results-header';
  snippetList.insertBefore(tagResultsHeader, snippetList.firstChild);
  const clearTagsButton = document.createElement('button');
  clearTagsButton.textContent = 'Clear Tags';
  clearTagsButton.addEventListener('click', function() {
    window.location.hash = '';
    displaySnippets(snippets, snippetList);
  });
  tagResultsHeader.appendChild(clearTagsButton);
  
  displaySnippets(snippets, snippetList); // <-- Add this line
}


function displaySnippets(snippets, snippetList = document.getElementById('snippet-list')) {
  if (!snippetList) {
    return;
  }

  snippetList.innerHTML = ''; // Clear the list

  const tag = window.location.hash.substring(1);
  if (tag !== '') {
    snippets = filterByTag(snippets, tag);
    showTagResults(snippets, tag, snippetList);
  } else {
    clearTagResults();
  }

  snippets.forEach(function(snippet) {
    const snippetItem = createSnippetItem(snippet, snippetList);
    snippetList.appendChild(snippetItem);
  });
}






function createSnippetItem(snippet, snippetList) {
  const snippetItem = document.createElement('li');
  const snippetCode = document.createElement('pre');

  if (snippet['code-textarea']) {
    const codeTextArea = document.createElement('code');
    codeTextArea.textContent = snippet.code;
    snippetCode.appendChild(codeTextArea);
  } else {
    snippetCode.textContent = snippet.code;
  }

  const snippetDescription = document.createElement('p');
  snippetDescription.textContent = snippet.description;

  const snippetCopyButton = document.createElement('button');
  snippetCopyButton.textContent = '🗐';
  snippetCopyButton.classList.add('copy-button');
  snippetCopyButton.addEventListener('click', function() {
    navigator.clipboard.writeText(snippet.code);
  });

  const snippetDeleteButton = document.createElement('button');
  snippetDeleteButton.textContent = '␡';
  snippetDeleteButton.classList.add('delete-button');
  snippetDeleteButton.addEventListener('click', function() {
    const confirmed = confirm(`Are you sure you want to delete the "${snippet.name}" snippet?`);
    if (confirmed) {
      deleteSnippet(snippet);
    }
  });

  const snippetEditButton = document.createElement('button');
  snippetEditButton.textContent = '✎';
  snippetEditButton.classList.add('edit-button');
  snippetEditButton.addEventListener('click', function() {
    editSnippet(snippet);
  });

  const tagContainer = createTagContainer(snippet, snippetList); // pass in the snippetList to createTagContainer

  const snippetDate = new Date(snippet.id).toLocaleString();
  const snippetDateElement = document.createElement('div');
  snippetDateElement.textContent = `Added on ${snippetDate}`;
  snippetDateElement.classList.add('snippet-date');

  const snippetDesc = document.createElement('div');
  snippetDesc.classList.add('snippet-desc');
  snippetDesc.textContent = snippet.desc;

  snippetItem.innerHTML = `<h3>${snippet.name}</h3>`;
  snippetItem.appendChild(snippetCopyButton);
  snippetItem.appendChild(snippetEditButton);
  snippetItem.appendChild(snippetDeleteButton);
  snippetItem.appendChild(tagContainer);
  snippetItem.appendChild(snippetDesc);
  snippetItem.appendChild(snippetCode);
  snippetItem.appendChild(snippetDateElement);

  return snippetItem;
}





function createTagContainer(snippet, snippetList) {
  const tagContainer = document.createElement('div');
  tagContainer.classList.add('tag-container');
  const tagLabel = document.createElement('span');
  tagLabel.textContent = 'Tags: ';
  tagLabel.classList.add('tag-label');
  tagContainer.appendChild(tagLabel);
  const tags = snippet.tags.split(',').map(function(tag) {
    return tag.trim();
  });
  tags.forEach(function(tag) {
    const tagLink = document.createElement('a');
    tagLink.textContent = tag.toLowerCase();
    tagLink.href = `#${tag.toLowerCase()}`;
    tagLink.addEventListener('click', function(event) {
      event.preventDefault();
      const clickedTag = event.target.textContent;
      const filteredSnippets = filterByTag(savedSnippets, clickedTag);
      displaySnippets(filteredSnippets, snippetList);
      let tagResultsHeader = document.getElementById('tag-results-header');
      if (!tagResultsHeader) {
        tagResultsHeader = document.createElement('h3');
        tagResultsHeader.id = 'tag-results-header';
        snippetList.insertBefore(tagResultsHeader, snippetList.firstChild);
      }
      tagResultsHeader.textContent = `Showing results with the tag "${clickedTag}".`;
      const clearTagsButton = document.createElement('button');
      clearTagsButton.textContent = 'Clear Tags';
      clearTagsButton.classList.add('clear-tags-button');
      clearTagsButton.style.marginLeft = '100px';

      
      clearTagsButton.addEventListener('click', function() {
        window.location.hash = '';
        displaySnippets(savedSnippets, snippetList);
      });
      tagResultsHeader.appendChild(clearTagsButton);
    });
    tagContainer.appendChild(tagLink);
  });
  return tagContainer;
}






function createTagLink(tag) {
  const tagLink = document.createElement('a');
  tagLink.textContent = tag.toLowerCase();
  tagLink.href = `#${tag.toLowerCase()}`;
  return tagLink;
}

function filterSnippetsByTag(snippets, tag) {
  if (!tag) {
    return snippets;
  }
  return snippets.filter(function(snippet) {
    return snippet.tags.split(',').map(function(t) {
      return t.trim().toLowerCase();
    }).includes(tag.toLowerCase());
  });
}

function createTagResultsHeader(tag, clearTagsButtonCallback) {
  const tagResultsHeader = document.createElement('h3');
  tagResultsHeader.textContent = `Showing results with the tag "${tag}".`;
  const clearTagsButton = document.createElement('button');
  clearTagsButton.textContent = 'Clear Tags';
  clearTagsButton.addEventListener('click', clearTagsButtonCallback);
  tagResultsHeader.appendChild(clearTagsButton);
  return tagResultsHeader;
}

function clearTagResults() {
  const tagResultsHeader = document.getElementById('tag-results-header');
  if (tagResultsHeader) {
    tagResultsHeader.remove();
  }
}

 




 

function addSnippet(snippetList) {
  const snippetNameInput = document.getElementById('snippet-name');
  const snippetCodeInput = document.getElementById('snippet-code');
  const snippetTagsInput = document.getElementById('snippet-tags');
  const snippetDescInput = document.getElementById('snippet-desc');

  const snippetName = snippetNameInput.value.trim();
  const snippetCode = snippetCodeInput.value.trim();
  const snippetTags = snippetTagsInput.value.trim();
  const snippetDesc = snippetDescInput.value.trim();

  // Check for duplicate snippets
  const duplicateName = savedSnippets.some(function(snippet) {
    return snippet.name === snippetName && snippet !== snippetToUpdate;
  });
  const duplicateCode = savedSnippets.some(function(snippet) {
    return snippet.code === snippetCode && snippet !== snippetToUpdate;
  });

  if (duplicateName) {
    alert('A snippet with that name already exists.');
    return;
  }
  if (duplicateCode) {
    alert('A snippet with that code already exists.');
    return;
  }

  // Create new snippet object
  const newSnippet = {
    id: Date.now(),
    name: snippetName,
    code: snippetCode,
    tags: snippetTags,
    desc: snippetDesc,
    timestamp: new Date().toLocaleString()
  };

  // If snippetToUpdate exists, update it, otherwise add newSnippet to savedSnippets
  if (snippetToUpdate) {
    const index = savedSnippets.indexOf(snippetToUpdate);
    savedSnippets[index] = newSnippet;
    snippetToUpdate = null;
  } else {
    savedSnippets.push(newSnippet);
  }

  // Update localStorage
  localStorage.setItem('snippets', JSON.stringify(savedSnippets));

  // Clear form fields
  snippetNameInput.value = '';
  snippetCodeInput.value = '';
  snippetTagsInput.value = '';
  snippetDescInput.value = '';

  // Update snippet list
  displaySnippets(savedSnippets, snippetList);
}

  
function updateSnippet() {
  const snippetNameInput = document.getElementById('snippet-name');
  const snippetCodeInput = document.getElementById('snippet-code');
  const snippetTagsInput = document.getElementById('snippet-tags');
  const snippetDescInput = document.getElementById('snippet-desc');

  const snippetName = snippetNameInput.value.trim();
  const snippetCode = snippetCodeInput.value.trim();
  const snippetTags = snippetTagsInput.value.trim();
  const snippetDesc = snippetDescInput.value.trim();

  if (!document.getElementById('snippet-form').checkValidity()) {
    return;
  }

  const duplicateName = savedSnippets.some(function(snippet) {
    return snippet.name === snippetName && snippet !== snippetToUpdate;
  });
  const duplicateCode = savedSnippets.some(function(snippet) {
    return snippet.code === snippetCode && snippet !== snippetToUpdate && snippet.name === snippetToUpdate.name;
  });

  if (duplicateName) {
    alert('A snippet with that name already exists.');
    return;
  }
  if (duplicateCode) {
    alert('A snippet with that code already exists.');
    return;
  }

  snippetToUpdate.name = snippetName;
  snippetToUpdate.code = snippetCode;
  snippetToUpdate.tags = snippetTags;
  snippetToUpdate.desc = snippetDesc; // add description
  snippetToUpdate.dateModified = new Date();
  localStorage.setItem('snippets', JSON.stringify(savedSnippets));

  // Reset the form and update the snippet list
  snippetNameInput.value = '';
  snippetCodeInput.value = '';
  snippetTagsInput.value = '';
  snippetDescInput.value = ''; // reset description field
  const addSnippetButton = document.getElementById('add-snippet-button'); // define addSnippetButton
  addSnippetButton.textContent = 'Add Snippet';
  addSnippetButton.removeEventListener('click', updateSnippet);
  addSnippetButton.addEventListener('click', addSnippet);
  snippetToUpdate = null;

  // Update the snippet list on the webpage
  const snippetList = document.getElementById('snippet-list');
  displaySnippets(savedSnippets, snippetList);

  toggleForm(true);
}


  
  
  
  

function deleteSnippet(snippet) {
  console.log('Before deletion:', savedSnippets);
  savedSnippets.splice(savedSnippets.indexOf(snippet), 1);
  localStorage.setItem('snippets', JSON.stringify(savedSnippets));
  console.log('After deletion:', savedSnippets);
  displaySnippets(savedSnippets);
}


function searchSnippets(snippets, searchTerm) {
    return snippets.filter(function(snippet) {
      return snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  function toggleForm(isHidden) {
    const form = document.getElementById('snippet-form');
    const button = document.getElementById('toggle-form-button');
    if (isHidden) {
      form.classList.remove('hidden');
      toggleFormButton.textContent = '-';
      toggleFormButton.title = 'hide form';
    } else {
      form.classList.add('hidden');
      toggleFormButton.textContent = '+';
      toggleFormButton.title = 'add new snippet';
    }
  }
  
  
  const toggleFormButton = document.getElementById('toggle-form-button');
  toggleFormButton.addEventListener('click', function() {
    const form = document.getElementById('snippet-form');
    const isHidden = form.classList.contains('hidden');
    toggleForm(isHidden);
  });

  function editSnippet(snippet) {
    snippetToUpdate = snippet;
    const snippetNameInput = document.getElementById('snippet-name');
    const snippetCodeInput = document.getElementById('snippet-code');
    const snippetTagsInput = document.getElementById('snippet-tags');
    const snippetDescInput = document.getElementById('snippet-desc');
  
    // Populate the form fields with the selected snippet
    snippetNameInput.value = snippetToUpdate.name;
    snippetCodeInput.value = snippetToUpdate.code;
    snippetTagsInput.value = snippetToUpdate.tags;
    snippetDescInput.value = snippetToUpdate.desc;
  
    const addSnippetButton = document.getElementById('add-snippet-button');
    addSnippetButton.textContent = 'Update';
    addSnippetButton.removeEventListener('click', addSnippet);
    addSnippetButton.addEventListener('click', function() {
      updateSnippet();
      toggleForm(true);
    });
  
    // Show the add snippet form and hide the toggle button
    const addSnippetForm = document.getElementById('snippet-form');
    addSnippetForm.classList.remove('hidden');
    toggleFormButton.classList.add('hidden');
  
    // Remove any existing cancel button
    const cancelEditButton = document.getElementById('cancel-edit-button');
    if (cancelEditButton) {
      cancelEditButton.removeEventListener('click', cancelEdit);
      cancelEditButton.remove();
    }
  
    // Add a cancel button
    const newCancelButton = document.createElement('button');
    newCancelButton.textContent = 'Cancel';
    newCancelButton.setAttribute('id', 'cancel-edit-button');
    newCancelButton.style.float = 'right';
    newCancelButton.addEventListener('click', cancelEdit);
    addSnippetForm.appendChild(newCancelButton);
  
    // Move update button to the left
    addSnippetButton.style.float = 'left';
  
    // Update the snippet list on the webpage
    const snippetList = document.getElementById('snippet-list');
    displaySnippets(savedSnippets, snippetList);
  }
  
  
  
  
  
  
  

  function cancelEdit() {
    const addSnippetButton = document.getElementById('add-snippet-button');
    addSnippetButton.textContent = 'Add Snippet';
    addSnippetButton.removeEventListener('click', updateSnippet);
    addSnippetButton.addEventListener('click', addSnippet);
  
    const snippetNameInput = document.getElementById('snippet-name');
    const snippetCodeInput = document.getElementById('snippet-code');
    const snippetTagsInput = document.getElementById('snippet-tags');
    const snippetDescInput = document.getElementById('snippet-desc');
  
    snippetNameInput.value = '';
    snippetCodeInput.value = '';
    snippetTagsInput.value = '';
    snippetDescInput.value = '';
  
    toggleForm(false);

    const toggleFormButton = document.getElementById('toggle-form-button');
    toggleFormButton.classList.remove('hidden');
}

  
  function updateTagFilterDescription(tag) {
    const tagFilterDescription = document.getElementById('tag-filter-description');
    tagFilterDescription.textContent = `Showing results with the tag ${tag}`;
  }


  
  
  
  
  