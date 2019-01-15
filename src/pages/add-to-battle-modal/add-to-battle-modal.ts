import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

import { IParty } from '../../services/party.service';
import { ICreature } from '../../services/creature.service';

@IonicPage()
@Component({
	selector: 'page-add-to-battle-modal',
	templateUrl: 'add-to-battle-modal.html',
})
export class AddToBattleModalPage {

	private creatures: ICreature[] = [];
	private parties: IParty[] = [];

	private creaturesId: number[] = [];
	private partiesId: number[] = [];

	private creaturesSendBack: ICreature[] = [];

	private nameSearch: string = "";
	private isPlayer: boolean = true;
	private isMonster: boolean = true;
	private isParty: boolean = true;

	constructor(private navParams: NavParams, private viewController: ViewController) {}
	  
	async ionViewWillEnter(){
		this.creatures = await this.navParams.get("creatures").slice().sort(function(a, b){
			if(a.name < b.name) return -1;
			if(a.name > b.name) return 1;
			return 0;
		});
		this.parties = await this.navParams.get("parties").slice().sort(function(a, b){
			if(a.name < b.name) return -1;
			if(a.name > b.name) return 1;
			return 0;
		});
	}

	removeCreature(creature: ICreature){
		if(this.creaturesId[creature.id])
			this.creaturesId[creature.id]--;
	}
	addCreature(creature: ICreature){
		if(!this.creaturesId[creature.id])
			this.creaturesId[creature.id] = 0;
		this.creaturesId[creature.id]++;
	}

	removeParty(party: IParty){
		if(this.partiesId[party.id])
			this.partiesId[party.id]--;
	}
	addParty(party: IParty){
		if(!this.partiesId[party.id])
			this.partiesId[party.id] = 0;
		this.partiesId[party.id]++;
	}

	closeMe(){
		this.viewController.dismiss();
	}
	returnThisCreatures(){
		for (let i = 0; i < this.partiesId.length; i++) {
			var flag = true;
			for (let j = 0; j < this.parties.length && flag; j++){
				if(i === this.parties[j].id){
					flag = false;
					for (let k = 0; k < this.parties[j].creaturesId.length; k++){
						if(!this.creaturesId[this.parties[j].creaturesId[k]])
							this.creaturesId[this.parties[j].creaturesId[k]] = 0;
						this.creaturesId[this.parties[j].creaturesId[k]]++;
					}
				}
			}
		}

		for (let i = 0; i < this.creaturesId.length; i++)
			if(this.creaturesId[i]){
				var flag = true;
				for (let j = 0; j < this.creatures.length && flag; j++)
					if(this.creatures[j].id === i){
						flag = false;
						for (let k = 0; k < this.creaturesId[i]; k++)
							this.creaturesSendBack.push(this.creatures[j]);
					}
			}

		this.viewController.dismiss(this.creaturesSendBack);
	}
}