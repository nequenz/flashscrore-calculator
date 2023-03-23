
function GetPage( name )
{
	return document.getElementsByClassName( "sportName " + name )[0];
}

function GetGames( name )
{
	return GetPage( name ).querySelectorAll("div[title='Подробности матча!']")
}

function GetScores( name )
{
	const Games = GetGames( name );
	let values;
	let gameResult = [];
	let results = [];
	
	for( let i = 0; i < Games.length; i ++ )
	{
		values = Games[ i ].innerText.match(/\d+/gi);
		gameResult = [];
		
		if( values == null )
			continue;
		
		values.forEach( ( strValue ) => 
		{
			gameResult.push( parseInt( strValue ) );
		} );
		
		results.push( gameResult );
	}
	
	return results;
}

function CalculateOddEven( scores, noValues )
{
	let score;
	let sumValue = 0;
	let results = [];
	let gameResult = []
	const OddEvenValues = [ 0, 0 ];
	
	for( let i = 0; i < scores.length; i ++ )
	{
		score = scores[ i ];
		gameResult = [];
		
		score.forEach( ( value, index ) => 
		{
			sumValue += value;
			
			if( index % 2 == 1)
			{
				if( noValues == false )
					gameResult.push( ( sumValue % 2 == 1 ? "Н" : "Ч") + " (" +sumValue + ")" );
				else
					gameResult.push( ( sumValue % 2 == 1 ? "Н" : "Ч") );
				
				if( sumValue % 2 == 1 )
					OddEvenValues[ 0 ] += 1;
				else
					OddEvenValues[ 1 ] += 1;
				
				sumValue = 0;
			}
		} );
		
		results.push( gameResult );
	}
	
	console.log( "Н : " + OddEvenValues[ 0 ] + " Ч : " + OddEvenValues[ 1 ] );

	return results;
}

function AcceptRule( rule, games, isOffsetable, cash )
{
	let game;
	let gameValue;
	let ruleValue;
	let count = 0;
	let offset = 0;
	let resultText = "";
	
	rule = rule.match(/[НЧ]/gi);
	
	for( let i = 0; i < games.length; i ++ )
	{
		game = games[ i ];
	
		for( let k = 0; k < game.length; k ++ )
		{
			count ++;
			gameValue = game[ k ];
			ruleValue = rule[ ( count - offset ) % rule.length];
			
			if( ruleValue == gameValue )
			{
				cash.Play( true );
				
				resultText += "+ *** pos:" + count + ", Game Value: " + gameValue + "  Rule Value: " + ruleValue + "\n";
				
				if( isOffsetable == true )
					offset = count + 1;
			}
			else
			{
				cash.Play( false );
				resultText += "- *** pos:" + count + ", Game Value: " + gameValue + "  Rule Value: " + ruleValue + "\n";

				if( cash.CurrentCash <= 0)
				{
					resultText += "cash is over\n";
					
					console.log( resultText );
					
					return;
				}
			}
		}
	}
	
	resultText += "finished\n";
	
	console.log( resultText );
}

function CalculateCash( cash, need, factor, steps )
{
	let needCash = need;
	let needCashDec = ( needCash - cash ) / steps;
	let playCash;
	let currentCash = cash;
	
	for( let i = 0; i < steps; i ++ )
	{
		playCash = ( needCash - currentCash ) / ( factor - 1 );
		currentCash -= playCash;
		needCash -= i > 0 ? needCashDec : 0;
		
		console.log("CC:" + currentCash.toFixed(2) + " -> NC:" + needCash.toFixed(2) + ", PC:" + playCash.toFixed(2));
	}
}

class Cash
{
	StartCash;
	NeededCash;
	NeededCashDec;
	Order;
	CurrentCash;
	Factor;
	Steps;
	Step;
	
	constructor( cash, order, factor, steps )
	{
		this.StartCash = cash;
		this.Order = order;
		this.Factor = factor;
		this.NeededCash = this.StartCash + this.Order;
		this.Steps = steps;
		this.NeededCashDec = this.Order / this.Steps;
		this.CurrentCash = this.StartCash;
		this.Step = 0;
	}
	
	Play = function( isWin )
	{
		let playableCash = ( this.NeededCash - this.CurrentCash ) / ( this.Factor - 1 );
		let color;
		
		this.CurrentCash -= playableCash;
		
		if( this.CurrentCash <= 0 )
		{
			console.log("Current cash is out:" + this.CurrentCash.toFixed(2) + " C");
			
			return;
		}
		
		if( isWin )
		{
			this.NeededCash += this.Order;
			this.Step = 0;
			this.CurrentCash += playableCash * this.Factor;
			color = "background: #222; color: green";
		}
		else
		{
			this.NeededCash -= ( this.Step > 0 ) ? this.NeededCashDec : 0;
			this.Step ++;
			color = "background: #222; color: red";
		}

		console.log( "%cCurrent cash:" + this.CurrentCash.toFixed(2) + " C, Needed cash:" + this.NeededCash.toFixed(2) + " C, Play cash:" + playableCash.toFixed(2) + " C", color );
	}
} 


//let TCash = new Cash( 5000, 100, 1.85, 5 );

AcceptRule( "Ч", CalculateOddEven( GetScores("basketball"), true ), false, new Cash( 5000, 100, 1.85, 5 ) );