const divListagem = document.getElementById("listagem");

class Pasta {
	constructor(_nome,_pai = null) {
		this.nome = _nome;
		this.pai = _pai;

		this.icone = "📁";
		if (this.pai == null) {
			this.icone = "💾";
		}

		this.elPasta = document.createElement("div");
		this.elPasta.innerHTML = this.icone + " " + this.nome;
		divListagem.appendChild(this.elPasta);
	}
}

var raiz = new Pasta("Queenskilo (E:)");

function obterListagem() {
	new Pasta("DOCUMENTOS",raiz);
	new Pasta("arquivos",raiz);
	new Pasta("arquivos (2)",raiz);
	new Pasta("irpf",raiz);
	new Pasta("Nova pasta (2)",raiz);
	new Pasta("não abrir",raiz);
	new Pasta("firefox_x64_portable",raiz);
	new Pasta("asdfasdfasg",raiz);
	new Pasta("musicas",raiz);
	new Pasta("Godzilla_minus_one_FULL_4K_JUNINF1LM3S__",raiz);
}

obterListagem();