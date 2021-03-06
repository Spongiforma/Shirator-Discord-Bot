/*
TODO: !debug (change settings in case users are locked out), admin only commands
*/
const fs = require('fs');
const Discord = require('discord.js');
const {token} = require('./settings/config.json');
const default_settings = require('./settings/default_server_settings.json');
const Enmap = require('enmap');
const client = new Discord.Client();
const queue = new Map();

client.settings = new Enmap({
	name: 'settings',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep'
})

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Shirator is online');
		client.user.setPresence({
			activity:{
				//name: 'Type ::help for a great good',
				name: 'Feeding floozy /jp/ touhou posters',
				type: 'PLAYING',
				url: 'https://github.com/Spongiforma/Shirator-Discord-Bot'
			}
		})
	setInterval(function (){
		client.user.setPresence({
			activity:{
				//name: 'Type ::help for a great good',
				name: 'Headhunter - Kapo! by Death in June',
				type: 'PLAYING',
				url: 'https://github.com/Spongiforma/Shirator-Discord-Bot'
			}
		})
	},1000*3600*24);
});

client.on("guildDelete",guild =>{
	client.settings.delete(guild.id);
})

client.on('message', message => {
	if(message.channel.type === 'dm'){
		return;
	}
	client.settings.ensure(message.guild.id,default_settings);
	let {prefix,admin_role} = client.settings.get(message.guild.id);
	if(message.content.slice(0,prefix.length) !== prefix)return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if(!client.commands.has(commandName)) return;
	const command = client.commands.get(commandName);

	if(command.min_args && !args.length)
		return message.reply('Missing one or more arguments');

	// if(admin_role && command.admin_only && !message.member.roles.cache.has(admin_role.id))
	// 	return message.reply(`This command is restricted to users with the \`${admin_role}\` role.`);

	try{
		if(command.name === 'play')
			command.execute(message,args,queue);
		else
			command.execute(message,args);
	} catch(error){
		console.error(error);
		message.reply('Oopsie whoopsie, there appears to be an error!');
	}
});

client.login(token)
