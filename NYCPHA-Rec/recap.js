const scriptURL = "https://script.google.com/macros/s/AKfycbz_vtT-ECUYrCkDkIvZUU_F4WtmJFalIkHg8MY5gZ3fO85oZUk3JgRSBD67XZDju_Q/exec"; 

async function initGamePage(gameId) {
    try {
        const response = await fetch(`${scriptURL}?game=${encodeURIComponent(gameId)}`);
        const data = await response.json();
        
        // DEBUG: Right-click your page -> Inspect -> Console to see this!
        console.log("Data received from Google:", data);

        // 1. Update Header (with fallbacks)
        $('#game-date').text(`${data.gameInfo?.date || 'N/A'} | ${data.gameInfo?.time || ''}`);
        $('#home-team-name').text(data.gameInfo?.homeTeam || 'Home');
        $('#away-team-name').text(data.gameInfo?.awayTeam || 'Away');
        $('#home-score').text(data.gameInfo?.homeScore ?? 0);
        $('#away-score').text(data.gameInfo?.awayScore ?? 0);
        $('#game-rink').text(data.gameInfo?.rink || '');

        // 2. Build Linescore
        if (data.linescore) {
            const h = data.linescore.home;
            const a = data.linescore.away;
            $('#linescore-body').html(`
                <tr>
                    <td class="team-name-cell">${data.gameInfo.homeTeam}</td>
                    <td>${h.p1}</td><td>${h.p2a}</td><td>${h.p2b}</td><td>${h.p3}</td>
                    <td class="total-cell">${data.gameInfo.homeScore}</td>
                </tr>
                <tr>
                    <td class="team-name-cell">${data.gameInfo.awayTeam}</td>
                    <td>${a.p1}</td><td>${a.p2a}</td><td>${a.p2b}</td><td>${a.p3}</td>
                    <td class="total-cell">${data.gameInfo.awayScore}</td>
                </tr>
            `);
        }

        // 3. Scoring Table (Check if data.scoring exists)
        if ($.fn.DataTable.isDataTable('#scoringTable')) {
            $('#scoringTable').DataTable().destroy();
        }
        $('#scoringTable').DataTable({
            data: data.scoring || [],
            paging: false,
            searching: false,
            info: false,
            columns: [
                { data: 'period', defaultContent: "" },
                { data: 'time', defaultContent: "" },
                { data: 'team', defaultContent: "" },
                { data: 'scorer', defaultContent: "" },
                { 
                    data: null, 
                    render: d => `${d.assist1 || ''}${d.assist2 ? ', ' + d.assist2 : ''}` 
                },
                { data: 'type', defaultContent: "ES" },
                { data: 'description' }
            ]
        });

        // 4. Penalty Table
        if ($.fn.DataTable.isDataTable('#penaltyTable')) {
            $('#penaltyTable').DataTable().destroy();
        }
        $('#penaltyTable').DataTable({
            data: data.penalties || [],
            paging: false,
            searching: false,
            info: false,
            columns: [
                { data: 'period', defaultContent: "" },
                { data: 'time', defaultContent: "" },
                { data: 'team', defaultContent: "" },
                { data: 'player', defaultContent: "" },
                { data: 'pim', defaultContent: "2" },
                { data: 'infraction', defaultContent: "" }
            ]
        });

    } catch (err) {
        console.error("JavaScript Error:", err);
        document.body.prepend("Error: Make sure your Script URL is correct and Deployment is set to 'Anyone'.");
    }
}

$(document).ready(() => {
    initGamePage("PJPC TESTING Game 1");
});