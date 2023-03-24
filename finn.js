
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
		
		if( values === null )
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
			
			if( index % 2 === 1)
			{
				if( noValues === false )
					gameResult.push( ( sumValue % 2 === 1 ? "Н" : "Ч") + " (" +sumValue + ")" );
				else
					gameResult.push( ( sumValue % 2 === 1 ? "Н" : "Ч") );
				
				if( sumValue % 2 === 1 )
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
			
			if( ruleValue === gameValue )
			{
				cash.Play( true );
				
				resultText += "+ *** pos:" + count + ", Game Value: " + gameValue + "  Rule Value: " + ruleValue + "\n";
				
				if( isOffsetable === true )
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
	Count;
	MaxCash;
	
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
		this.Count = 1;
		this.MaxCash = this.StartCash;
	}
	
	Play = function( isWin )
	{
		let playableCash = ( this.NeededCash - this.CurrentCash ) / ( this.Factor - 1 );
		let color;
		
		if( this.CurrentCash <= 0 )
			return;
		
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
			this.NeededCash -= this.NeededCashDec;
			this.Step ++;
			color = "background: #222; color: red";
			
			if( this.Step > this.Steps )
			{
				this.NeededCash = this.CurrentCash + this.Order;
				this.Step = 0;
				
				console.log( "Step:" + this.Step +", Steps:" + this.Steps );
			}
		}

		console.log( "%c#" + this.Count + " Current cash:" + this.CurrentCash.toFixed(2) + " C, Needed cash:" + this.NeededCash.toFixed(2) + " C, Play cash:" + playableCash.toFixed(2) + " C", color );
		this.Count ++;
	}
} 



//AcceptRule( "Ч", CalculateOddEven( GetScores("basketball"), true ), false, new Cash( 5000, 100, 1.85, 5 ) );


//---------------------------------------------

function GetFactors( game )
{
	const First = game.children[ game.children.length - 2 ];
	const Second = game.children[ game.children.length - 1 ];
	let FFactor = First.title.match(/[\d.]+/gi);
	let SFactor = Second.title.match(/[\d.]+/gi);
	let FResult = First.className.search("win") >= 0 ? "+" : "-";
	let SResult = Second.className.search("win") >= 0 ? "+" : "-";
	
	if(FFactor != null)
		FFactor = parseFloat( FFactor[ 0 ] );
	
	if(SFactor != null)
		SFactor = parseFloat( SFactor[ 0 ] );
	
	return [FFactor, SFactor, FResult, SResult];
}

function FilterGames( games )
{
	let game;
	let result;
	const List = [];
	
	for( let i = 0; i < games.length; i ++ )
	{
		game = games[ i ];
		result = GetFactors( game );
		
		if( ( result[ 0 ] >= 2.0 && result[ 0 ] <= 2.1 )
			|| result[ 1 ] >= 2.0 && result[ 1 ] <= 2.1 )
		{
			List.push( result );
		}
	}
	
	return List;
}