const getPlayerDocument = require("./player-pdf-model");
const Pdfmake = require("pdfmake");
const path = require("path");

const fontDescriptors = {
    Roboto: {
        normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname,'fonts', 'Roboto-Medium.ttf'),
        italics: path.join(__dirname,'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname,'fonts', 'Roboto-MediumItalic.ttf')
    }
};

module.exports = (players, stream)=>{
    const printer = new Pdfmake(fontDescriptors);

    const dd = getPlayerDocument();

    dd.content[0].text = dd.content[0].text
        .replace('${numPlayers}', players.length);

    let content = players.map(player => [
        player.id,
        {
            image: player.profile_pic || "./defaultUserAvatar.png",
            fit: [50, 50]
        },
        player.username,
        player.level,
        player.last_connection.toLocaleString('en-US')
    ]);

    dd.content[1].table.body = dd.content[1].table.body.concat(content);

    const pdfDoc = printer.createPdfKitDocument(dd);

    pdfDoc.pipe(stream);
    pdfDoc.end();
};