module.exports = function() {
    return {
        content: [
            {text: 'Players (${numPlayers})', style: 'header'},
            {
                style: 'tableMovies',
                table: {
                    headerRows: 1,
                    body: [
                        [
                            {text: '#', style: 'tableHeader'},
                            {text: 'Avatar', style: 'tableHeader'},
                            {text: 'Username', style: 'tableHeader'},
                            {text: 'Level', style: 'tableHeader'},
                            {text: 'Last Connection', style: 'tableHeader'},
                        ]
                    ]
                }
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            tableMovies: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black',
                alignment: 'center'
            }
        },
        defaultStyle: {}
    };
};
