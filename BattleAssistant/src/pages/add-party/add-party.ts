import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Modal, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { CreatureService } from '../../services/creature.service';
import { PartyService } from '../../services/party.service';
import { AddCreaturePage } from '../add-creature/add-creature';

import { IParty } from '../../services/party.service';
import { ICreature } from '../../services/creature.service';
import { Localization } from './localization';

@IonicPage()
@Component({
	selector: 'page-add-party',
	templateUrl: 'add-party.html',
	providers: [Localization],
})
export class AddPartyPage {
	private party: IParty = {
		id: null,
		name: '',
		isEncounter: true,
		creaturesId: [],
	};
	private creatures: ICreature[] = [];
	private allCreatures: ICreature[] = [];
	private partyForm: any;

	constructor(public navCtrl: NavController, public navParams: NavParams, private partyService: PartyService, private creatureService: CreatureService, private formBuilder: FormBuilder, private modal: ModalController, private alertCtrl: AlertController, private msg: Localization){
		this.loadParty().then(()=>{
			if(this.party.creaturesId.length == 0)
				this.addCreature();
		});
		this.partyForm = formBuilder.group({
			id: ['', Validators.compose([])],
			name: ['', Validators.compose([Validators.required])],
		});
	}

	async loadParty(){
		var partyAux: IParty = await this.navParams.get("party");
		if(partyAux !== undefined && partyAux !== null) this.party = partyAux;
		this.allCreatures = await this.creatureService.getCreature();
    	if(this.party && this.party.id !== null){
			var deleteThisCreaturesId = [];
			for (let i = 0; this.party.creaturesId && i < this.party.creaturesId.length; i++) {
				var notFind = true;
				for (let j = 0; j < this.allCreatures.length; j++) {
					if(this.party.creaturesId[i] === this.allCreatures[j].id){
						notFind = false;
						this.creatures[this.creatures.length] = this.allCreatures[j];
					}
				}
				if(notFind)
					deleteThisCreaturesId[deleteThisCreaturesId.length] = i;
			}
			for (let i = deleteThisCreaturesId.length - 1; i >= 0; i--) {
				this.party.creaturesId.splice(deleteThisCreaturesId[i], 1);
			}
			if(deleteThisCreaturesId.length > 0)
				this.partyService.addParty(this.party);
		}
		return;
	}
	addCreature(){
		let alert = this.alertCtrl.create({
			title: this.msg["addCreatureTittle"],
			buttons: [
				{
					text: this.msg["newCreature"],
					handler: data => {
						this.newCreatureModal();
					}
				},
				{
					text: this.msg["existingCreature"],
					handler: data => {
						this.existingCreatureModal();
					}
				},
				{
					text: this.msg["cancel"],
					role: "cancel",
					handler: data => {}
				}
			]
		});
		alert.present();
	}
	newCreatureModal(){
		var modalView: Modal = this.modal.create("AddCreaturePage", { isPlayer: true });
		modalView.present();
		modalView.onDidDismiss(async (creature? : ICreature[])=>{
			this.allCreatures = await this.creatureService.getCreature();
			this.pushCreatures(creature);
		});
	}
	existingCreatureModal(){
		if(!this.party.creaturesId)
			this.party.creaturesId = [];
		this.openModal();
	}
	trashCreature(creature: ICreature){
		for (let i = 0; i < this.party.creaturesId.length; i++) {
			if(this.party.creaturesId[i] === creature.id){
				this.party.creaturesId.splice(i, 1);
				break;
			}
		}

		for (let i = 0; i < this.creatures.length; i++) {
			if(this.creatures[i].id === creature.id){
				this.creatures.splice(i, 1);
				break;
			}
		}
	}
	renderAddCreaturePage(creature?: ICreature){
		this.navCtrl.push(AddCreaturePage, {creature});
	}
	onAddParty(party: IParty){
		this.party.name = party.name;
		this.partyService.addParty(this.party);
		this.navCtrl.pop();
	}
	trashThisParty(){
		if(this.party.id != null)
			this.partyService.delParty(this.party);
		this.navCtrl.pop();
	}

	openModal(){
		var creatures: ICreature[] = this.allCreatures;
		const modalView: Modal = this.modal.create("SearchCreatureModalPage", { creatures });

		modalView.present();

		modalView.onDidDismiss((creature? : ICreature[])=>{
			this.pushCreatures(creature);
		});
	}
	pushCreatures(creature? : ICreature[]){
		if(creature){
			console.log(creature);
			for (let i = 0; i < this.allCreatures.length; i++) {
				for (let j = 0; j < creature.length; j++) {
					if(creature[j].id === this.allCreatures[i].id){
						this.party.creaturesId[this.party.creaturesId.length] = creature[j].id;
						this.creatures[this.creatures.length] = this.allCreatures[i];
					}
				}
			}
			this.sortCreatures();
		}
	}
	sortCreatures(){
		this.creatures.sort(function(a, b){
			if(a.name < b.name) return -1;
			if(a.name > b.name) return 1;
			return 0;
		});
	}
}
