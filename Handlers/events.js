const fs = require('fs');
const colors = require('colors')

module.exports = (client) => {
	fs.readdirSync('./Events/').forEach((file) => {
		if (file.endsWith('.js')) {
			require(`../Events/${file}`);
		} else if (fs.statSync(`./Events/${file}`).isDirectory()) {
			fs.readdirSync(`./Events/${file}`).filter((subfile) => subfile.endsWith('.js')).forEach((event) => {
				require(`../Events/${file}/${event}`);
			});
		}
	});

	console.log(colors.bgGreen("✅ Eventos"))
};
