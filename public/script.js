const divDataHora = document.getElementById("dataHora");

function atualizarDataHora() {
	const agora = new Date();
	const dia = agora.toLocaleDateString('pt-BR');
	const hora = agora.toLocaleTimeString('pt-BR');
	divDataHora.innerHTML = `${hora} <br> ${dia}`;
}
atualizarDataHora();
setInterval(atualizarDataHora, 1000);

const divIniciar = document.getElementById("iniciar");
const divBotaoIniciar = document.getElementById("botaoIniciar");
var menuIniciarAberto = false;

divBotaoIniciar.onclick = ()=>{
	if (!menuIniciarAberto) {
		abrirIniciar();
	} else {
		fecharIniciar();
	}
}

function abrirIniciar() {
	menuIniciarAberto = true;
	divIniciar.classList.add("exibir");
}

function fecharIniciar() {
	menuIniciarAberto = false;
	divIniciar.classList.remove("exibir");
}

const audioUSBIn = document.getElementById("audioUSBIn");
const audioUSBOut = document.getElementById("audioUSBOut");

const divListagem = document.getElementById("listagem");
const divConteudo = document.getElementById("conteudo");
const inputEndereco = document.getElementById("endereco");
const divJanela = document.getElementById("janela");
const divJanelaTitulo = document.getElementById("titulo");
var pastaSelecionada = null;
var itemSelecionado = null;

class Pasta {
	constructor(_nome, _pai = null) {
		this.nome = _nome;
		this.pai = _pai;

		this.conteudo = [];
		this.icone = "📁";
		this.aberto = false;
		this.emExibicao = false;

		this.elItem = document.createElement("div");
		this.elItem.classList.add("pasta");
		this.elNome = document.createElement("div");
		this.elNome.innerHTML = this.icone + " " + this.nome;
		this.elItem.appendChild(this.elNome);
		this.elItem.onclick = ()=>{
			if (!this.aberto) {
				this.exibirConteudo();
			} else {
				if (this.emExibicao) {
					this.esconderConteudo();
				} else {
					this.exibirConteudo();
				}
			}
		}
		this.elConteudo = document.createElement("div");
		this.elConteudo.classList.add("conteudo");

		if (this.pai == null) {
			this.icone = "💾";
			this.atualizarNome();
			divListagem.appendChild(this.elItem);
			divListagem.appendChild(this.elConteudo);
		}

		this.itemConteudo = new ItemConteudo(this);
	}

	adicionarConteudo(item) {
		this.conteudo.push(item);
		this.conteudo.sort((a, b) => a.nome.localeCompare(b.nome));
		
		// Reconstruir elementos no DOM em ordem
		this.elConteudo.innerHTML = "";
		for (let contentItem of this.conteudo) {
			if (contentItem.elConteudo != undefined) {
				this.elConteudo.appendChild(contentItem.elItem);
				this.elConteudo.appendChild(contentItem.elConteudo);
			}
		}
	}

	atualizarNome() {
		this.elNome.innerHTML = this.icone + " " + this.nome;
	}

	exibirConteudo(_exibirPasta = true) {
		this.aberto = true;
		this.elConteudo.classList.add("exibir");
		this.elConteudo.scrollIntoView();
		if (this.icone == "📁") {
			this.icone = "📂";
		}
		this.atualizarNome();
		if (_exibirPasta) {
			exibirPasta(this);
		}
	}

	esconderConteudo() {
		this.aberto = false;
		this.elConteudo.classList.remove("exibir");
		if (this.icone == "📂") {
			this.icone = "📁";
		}
		this.atualizarNome();
	}

	obterCaminho() {
		if (this.pai == null) {
			return "E:\\";
		} else {
			return this.pai.obterCaminho() + this.nome + "\\";
		}
	}
}

class Arquivo {
	constructor(_nome, _tamanho, _link = null, _pai) {
		this.nome = _nome;
		this.tamanho = _tamanho;
		this.link = _link;
		this.pai = _pai; // sempre uma Pasta

		// Extrair extensão e definir ícone
		const extensao = this.nome.substring(this.nome.lastIndexOf('.') + 1).toLowerCase();
		const iconesExtensao = {
			'pdf': '📕',
			'doc': '📄', 'docx': '📄', 'txt': '📄',
			'xls': '📊', 'xlsx': '📊', 'csv': '📊',
			'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
			'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
			'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬',
			'zip': '📦', 'rar': '📦', '7z': '📦',
			'exe': '⚙️', 'msi': '⚙️'
		};
		this.icone = iconesExtensao[extensao] || "📄";

		this.elItem = document.createElement("div");
		let texto = this.icone + " " + this.nome + " (" + this.tamanho + " bytes)";
		if (this.link) {
			texto += ` <a href='${this.link}' target='_blank'>[ver]</a>`;
		}
		this.elItem.innerHTML = texto;

		this.itemConteudo = new ItemConteudo(this);
		//divListagem.appendChild(this.elItem);
	}
}

class ItemConteudo {
	constructor(_objeto) {
		this.objeto = _objeto;
		this.arquivo = _objeto instanceof Arquivo;

		this.elItem = document.createElement("div");
		this.elItem.classList.add("item");
		this.elItem.onclick = ()=>{
			selecionarItem(this);
		}
		this.elItem.ontouchstart = ()=>{
			this.touchMoved = false;
			selecionarItem(this);
		}
		this.elItem.ontouchmove = ()=>{
			this.touchMoved = true;
		}
		this.elItem.ontouchend = ()=>{
			if (!this.arquivo && !this.touchMoved) {
				this.objeto.exibirConteudo();
			}
		}

		this.elIcone = document.createElement("div");
		this.elIcone.classList.add("icone");
		this.elIcone.innerHTML = this.objeto.icone;
		this.elItem.appendChild(this.elIcone);
		this.elNome = document.createElement("div");
		this.elNome.classList.add("nome");
		this.elNome.innerHTML = this.objeto.nome;
		this.elItem.appendChild(this.elNome);
	}
}

function criarEstrutura(item, pai = null) {
	if (item.conteudo === null || item.conteudo === undefined) {
		// Arquivo
		return new Arquivo(item.nome, item.tamanho, item.link || null, pai);
	} else {
		// Pasta
		let pasta = new Pasta(item.nome, pai);
		for (let subItem of item.conteudo) {
			let conteudoObj = criarEstrutura(subItem, pasta);
			pasta.adicionarConteudo(conteudoObj);
		}
		return pasta;
	}
}

function selecionarItem(_item) {
	if (itemSelecionado != null) {
		itemSelecionado.elItem.classList.remove("selecionado");
	}
	itemSelecionado = _item;
	if (itemSelecionado != null) {
		itemSelecionado.elItem.classList.add("selecionado");
	}
}

function exibirPasta(pasta) {
	if (pastaSelecionada != null) {
		pastaSelecionada.emExibicao = false;
		pastaSelecionada.elItem.classList.remove("selecionada");
	}
	pastaSelecionada = pasta;
	pastaSelecionada.emExibicao = true;
	pastaSelecionada.elItem.classList.add("selecionada");
	if (!pastaSelecionada.aberto) {
		pastaSelecionada.exibirConteudo(false);
	}

	inputEndereco.value = pastaSelecionada.obterCaminho();
	divJanelaTitulo.children[0].innerHTML = pastaSelecionada.nome;

	selecionarItem(null);

	//console.log(pastaSelecionada);

	divConteudo.innerHTML = "";
	var listaPastas = [];
	var listaArquivos = [];

	for (let item of pastaSelecionada.conteudo) {
		if (item.itemConteudo.arquivo) {
			listaArquivos.push(item.itemConteudo.elItem);
		} else {
			listaPastas.push(item.itemConteudo.elItem);
		}
	}

	listaPastas.forEach(element => {
		divConteudo.appendChild(element);
	});
	listaArquivos.forEach(element => {
		divConteudo.appendChild(element);
	});
}

fetch("conteudo.json")
	.then(response => response.json())
	.then(data => {
		let novaPasta = criarEstrutura(data);
		if (novaPasta.pai == null) {
			novaPasta.exibirConteudo();
		}
	});

function inicializar() {
	setTimeout(()=>{
		audioUSBIn.play();
	},1000);
	setTimeout(()=>{
		audioUSBOut.play();
	},1500);
	setTimeout(()=>{
		audioUSBIn.play();
	},3200);
	setTimeout(()=>{
		divJanela.style.display="flex";
	},3500);
}