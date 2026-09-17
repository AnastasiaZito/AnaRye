//Metal Music Library - frontend JavaScript
//handles all API calls and UI updates

//base URL for API
const API_BASE = 'http://localhost:5000/api';

//Home page functions
//load statistics for home page
async function loadHomePageStats(){
    try{
        //fetch counts from all three endpoints
        const [artistsRes, albumsRes, songsRes] = await Promise.all([
            fetch(`${API_BASE}/artists`),
            fetch(`${API_BASE}/albums`),
            fetch(`${API_BASE}/songs`)
        ]);
        const artists = await artistsRes.json();
        const albums = await albumsRes.json();
        const songs = await songsRes.json();
        //update the card counts
        document.getElementById('artistsCount').textContent = artists.count || artists.data.length;
        document.getElementById('albumsCount').textContent = albums.count || albums.data.length;
        document.getElementById('songsCount').textContent = songs.count || songs.data.length;
    //update stats section
    document.getElementById('statsContainer').innerHTML = `
    <p>🎤<strong>${artists.count || artists.data.length}</strong> Artists in your collection</p>
    <p>💿<strong>${albums.count || albums.data.length}</strong> Albums ready to play</p>
    <p>🎵<strong>${songs.count || songs.data.length}</strong> Songs to blast</p>
    `;
    }
    catch (error){
      console.error('Error loading stats:', error);
      document.getElementById('statsContainer').innerHTML = '<p>Error loading statistics. Make sure the server is running.</p>';  
    }
}
//artists functions
//load all artists into the table
async function loadArtists() {
    try{
        const response = await fetch(`${API_BASE}/artists`);
        const result = await response.json();
        const tableBody = document.getElementById('artistsTableBody');
        if(!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">No artists found. Add one above!</td></tr>';
            return; 
        }
            tableBody.innerHTML = result.data.map(artist => ` 
                <tr>
                <td>${artist.artist_id}</td>
                <td>${artist.artist_name}</td>
                <td>${artist.genre}</td>
                <td>${artist.monthly_listeners.toLocaleString()}</td>
                <td>
                <button class="btn btn-edit" onclick="editArtist(${artist.artist_id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteArtist(${artist.artist_id})">Delete</button>
                </td>
                </tr>
                `).join('');
        } catch (error) {
            console.error('Error loading artists:', error);
            document.getElementById('artistsTableBody').innerHTML = '<tr><td colspan="5" class="loading">Error loading artists. Is the server running?</td></tr>';

        }
    }
    //handle artist form submission (create or update)
    document.addEventListener('DOMContentLoaded', function(){
        const artistForm = document.getElementById('artistForm');
        if(artistForm){
            artistForm.addEventListener('submit', async function(e){
                e.preventDefault();

                const artistId = document.getElementById('artistId').value;
                const artistData = {
                    artist_name: document.getElementById('artistName').value,
                    genre: document.getElementById('artistGenre').value,
                    monthly_listeners: parseInt(document.getElementById('artistListeners').value)
                };
                try {
                    let response;
                    if (artistId){
                        //UPDATE existing artist
                        response = await fetch(`${API_BASE}/artists/${artistId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(artistData)
                        });
                    
                    } else {
                        //CREATE new artist
                        response = await fetch(`${API_BASE}/artists`,{
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(artistData)
                        });
                    }
                    const result = await response.json();
                    if(result.success){
                        //reset form
                        artistForm.reset();
                        document.getElementById('artistId').value = '';
                        document.getElementById('formTitle').textContent = 'Add New Artist';
                        document.getElementById('artistSubmitBtn').textContent = 'Create Artist';
                        document.getElementById('cancelArtistBtn').style.display = 'none';

                        //reload the table
                        loadArtists();
                        alert(result.message);
                        } else {
                            alert('Error: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Error saving artist:', error);
                        alert('Error saving artist. Check the console for details.');
                    }
                
            });
        }
    });
    //edit an artist
    async function editArtist(id) {
        try {
            const response = await fetch(`${API_BASE}/artists/${id}`);
            const result = await response.json();

            if(result.success && result.data) {
                //fill form with artist data
                document.getElementById('artistId').value = result.data.artist_id;
                document.getElementById('artistName').value = result.data.artist_name;
                document.getElementById('artistGenre').value = result.data.genre;
                document.getElementById('artistListeners').value = result.data.monthly_listeners;

                //change form title and button
                document.getElementById('formTitle').textContent = 'Edit Artist';
                document.getElementById('artistSubmitBtn').textContent = 'Update Artist';
                document.getElementById('cancelArtistBtn').style.display = 'inline-block';

                //scroll to form
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth'});
            }
        } catch (error) {
            console.error('Error fetching artist:', error);
            alert('Error loading artist data.');
        }
    }
    //delete an artist
    async function deleteArtist(id) { 
        if (!confirm('Are you sure you want to delete this artist? ALL their albums and songs will also be deleted!')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/artists/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if(result.success) {
                loadArtists();
                alert(result.message);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting artist:', error);
            alert('Error deleting artist.');
        }
    }
    //cancel editing
    function cancelEdit() {
        document.getElementById('artistForm').reset();
        document.getElementById('artistId').value = '';
        document.getElementById('formTitle').textContent = 'Add New Artist';
        document.getElementById('artistSubmitBtn').textContent = 'Create Artist';
        document.getElementById('cancelArtistBtn').style.display = 'none';
    }
    //===============================
    //======albums functions=========
    //===============================
    //load all albums into table
async function loadAlbums() {
    try {
        const response = await fetch(`${API_BASE}/albums`);
        const result = await response.json();

        const tableBody = document.getElementById('albumsTableBody');
        
        if (!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">No albums found. Add one above!</td></tr>';
            return;
        }
        // Build table rows
        tableBody.innerHTML = result.data.map(album => `
            <tr>
                <td>${album.album_id}</td>
                <td>${album.album_name}</td>
                <td>${album.release_year}</td>
                <td>${album.number_of_listens.toLocaleString()}</td>
                <td>${album.artist_name}</td>
                <td>
                    <button class="btn btn-edit" onclick="editAlbum(${album.album_id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteAlbum(${album.album_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading albums:', error);
        document.getElementById('albumsTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">Error loading albums. Is the server running?</td></tr>';
    }
}
// Load artists into album form dropdown
async function loadArtistOptions() {
    try {
        const response = await fetch(`${API_BASE}/artists`);
        const result = await response.json();

        const select = document.getElementById('albumArtistId');
        if (select && result.data) {
            select.innerHTML = '<option value="">Select an artist...</option>' +
                result.data.map(artist => 
                    `<option value="${artist.artist_id}">${artist.artist_name} (${artist.genre})</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading artists for dropdown:', error);
    }
}

// Handle album form submission
document.addEventListener('DOMContentLoaded', function() {
    const albumForm = document.getElementById('albumForm');
    if (albumForm) {
        // Load artists for the dropdown
        loadArtistOptions();

        albumForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const albumId = document.getElementById('albumId').value;
            const albumData = {
                album_name: document.getElementById('albumName').value,
                release_year: parseInt(document.getElementById('albumReleaseYear').value),
                number_of_listens: parseInt(document.getElementById('albumListens').value),
                artist_id: parseInt(document.getElementById('albumArtistId').value)
            };

            try {
                let response;
                if (albumId) {
                    // UPDATE
                    response = await fetch(`${API_BASE}/albums/${albumId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(albumData)
                    });
                } else {
                    // CREATE
                    response = await fetch(`${API_BASE}/albums`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(albumData)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    albumForm.reset();
                    document.getElementById('albumId').value = '';
                    document.getElementById('albumFormTitle').textContent = 'Add New Album';
                    document.getElementById('albumSubmitBtn').textContent = 'Create Album';
                    document.getElementById('cancelAlbumBtn').style.display = 'none';
                    loadAlbums();
                    alert(result.message);
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error saving album:', error);
                alert('Error saving album.');
            }
        });
    }
});

// Edit an album
async function editAlbum(id) {
    try {
        const response = await fetch(`${API_BASE}/albums/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
            document.getElementById('albumId').value = result.data.album_id;
            document.getElementById('albumName').value = result.data.album_name;
            document.getElementById('albumReleaseYear').value = result.data.release_year;
            document.getElementById('albumListens').value = result.data.number_of_listens;
            document.getElementById('albumArtistId').value = result.data.artist_id;

            document.getElementById('albumFormTitle').textContent = 'Edit Album';
            document.getElementById('albumSubmitBtn').textContent = 'Update Album';
            document.getElementById('cancelAlbumBtn').style.display = 'inline-block';

            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching album:', error);
        alert('Error loading album data.');
    }
}

// Delete an album
async function deleteAlbum(id) {
    if (!confirm('Are you sure? All songs in this album will also be deleted!')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/albums/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadAlbums();
            alert(result.message);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting album:', error);
        alert('Error deleting album.');
    }
}
// ============================================
// Songs Functions
// ============================================

// Load all songs into the table
async function loadSongs() {
    try {
        const response = await fetch(`${API_BASE}/songs`);
        const result = await response.json();

        const tableBody = document.getElementById('songsTableBody');
        
        if (!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">No songs found. Add one above!</td></tr>';
            return;
        }

        // Build table rows
        tableBody.innerHTML = result.data.map(song => `
            <tr>
                <td>${song.song_id}</td>
                <td>${song.song_name}</td>
                <td>${song.release_year}</td>
                <td>${song.album_name}</td>
                <td>
                    <button class="btn btn-edit" onclick="editSong(${song.song_id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteSong(${song.song_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading songs:', error);
        document.getElementById('songsTableBody').innerHTML = 
            '<tr><td colspan="5" class="loading">Error loading songs. Is the server running?</td></tr>';
    }
}

// Load albums into song form dropdown
async function loadAlbumOptions() {
    try {
        const response = await fetch(`${API_BASE}/albums`);
        const result = await response.json();

        const select = document.getElementById('songAlbumId');
        if (select && result.data) {
            select.innerHTML = '<option value="">Select an album...</option>' +
                result.data.map(album => 
                    `<option value="${album.album_id}">${album.album_name} (by ${album.artist_name})</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading albums for dropdown:', error);
    }
}

// Handle song form submission
document.addEventListener('DOMContentLoaded', function() {
    const songForm = document.getElementById('songForm');
    if (songForm) {
        // Load albums for the dropdown
        loadAlbumOptions();

        songForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const songId = document.getElementById('songId').value;
            const songData = {
                song_name: document.getElementById('songName').value,
                release_year: parseInt(document.getElementById('songReleaseYear').value),
                album_id: parseInt(document.getElementById('songAlbumId').value)
            };

            try {
                let response;
                if (songId) {
                    // UPDATE
                    response = await fetch(`${API_BASE}/songs/${songId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(songData)
                    });
                } else {
                    // CREATE
                    response = await fetch(`${API_BASE}/songs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(songData)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    songForm.reset();
                    document.getElementById('songId').value = '';
                    document.getElementById('songFormTitle').textContent = 'Add New Song';
                    document.getElementById('songSubmitBtn').textContent = 'Create Song';
                    document.getElementById('cancelSongBtn').style.display = 'none';
                    loadSongs();
                    alert(result.message);
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error saving song:', error);
                alert('Error saving song.');
            }
        });
    }
});

// Edit a song
async function editSong(id) {
    try {
        const response = await fetch(`${API_BASE}/songs/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
            document.getElementById('songId').value = result.data.song_id;
            document.getElementById('songName').value = result.data.song_name;
            document.getElementById('songReleaseYear').value = result.data.release_year;
            document.getElementById('songAlbumId').value = result.data.album_id;

            document.getElementById('songFormTitle').textContent = 'Edit Song';
            document.getElementById('songSubmitBtn').textContent = 'Update Song';
            document.getElementById('cancelSongBtn').style.display = 'inline-block';

            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching song:', error);
        alert('Error loading song data.');
    }
}

// Delete a song
async function deleteSong(id) {
    if (!confirm('Are you sure you want to delete this song?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/songs/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadSongs();
            alert(result.message);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting song:', error);
        alert('Error deleting song.');
    }
}