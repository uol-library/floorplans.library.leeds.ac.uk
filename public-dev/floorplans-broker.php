<?php
/**
 * Floorplan request broker
 * 
 * Takes Location request passed from the Library Management System - Primo (in 
 * Configuration->General->Integration profiles->Floorplan links for Primo)
 * and creates new request with parameters for floorplans on the locations page of the Library website.
 * 
 * Example
 * 
 * The following URL is constructed in the Library Management System for an item in the catalogue:
 *
 * https://floorplans.library.leeds.ac.uk/floorplan?library=BL&classmark=Music+C-1+TEN%2FG&floor=blw2
 * 
 * This request is rewritten to this script, which turns it into a redirect to this URL:
 * 
 * https://library.leeds.ac.uk/locations/libraries/brotherton?floor=w2&classmark=Music%20C-1%20TEN/G#floorplans-brotherton
 * 
 * This page then loads an iframe with the following URL:
 * 
 * https://floorplans.library.leeds.ac.uk/brotherton/floors/w2?classmark=Music%20C-1%20TEN%2FG
 * 
 * The parameters in this URL are then used to highlight an area on the floorplan where the item is located
 */

	define('LUL_CLIENT_URL','https://library.leeds.ac.uk/locations/libraries');
	$libraries = array(
		'BL'	=> array(
			'name'			=> 'brotherton',
			'floorFunction' => 'blLocation',
		),
		'EBL'	=> array(
			'name'			=> 'edward-boyle',
			'floorFunction' => 'eblLocation',
		),
		'HSL'	=> array(
			'name'			=> 'health-sciences',
			'floorFunction' => 'hslLocation',
		),
		'LL'	=> array(
			'name'			=> 'laidlaw',
			'floorFunction' => 'llLocation',
		),
	);

	# print buildURL($libraries);
	header('Location: '.buildURL($libraries),true,301);
 	exit();


 	/**
	 * Builds the Library website URL for redirection
	 * @param array $libraries - config for each library
	 * @return string - the URL
	 */
	function buildURL($libraries) {
		$ret = LUL_CLIENT_URL;
		$hash = '';

		$params = getParams();
		if (array_key_exists('library',$params) &&
			array_key_exists($params['library'],$libraries)
		) {
			$ret .= '/'.$libraries[$params['library']]['name'];
			$hash = '#floorplans-'.$libraries[$params['library']]['name'];

			if (array_key_exists('floor',$params) &&
				!empty($params['floor']) &&
				array_key_exists('classmark',$params) &&
				!empty($params['classmark'])
				){

				list($floor,$classmark) = call_user_func(
					$libraries[$params['library']]['floorFunction'],
					$params['floor'],
					$params['classmark']
				);
				if (preg_match('/Video Film/i',$classmark)) $classmark .= ' DVD';
				$ret .= '?floor='.$floor.'&classmark='.$classmark;
			}
		}

		return "$ret$hash";
	}

	/*
	 *  Parse the query string - deal with Alma/Primo bug that encodes & as &amp;
	 */
	function getParams() {
		$ret = array();

		$p = trim(urldecode(preg_replace('/&amp;/','&',$_SERVER['QUERY_STRING'])));
		$params = explode('&',$p);

		if (is_array($params) && sizeof($params) > 0) {
			foreach ($params as $p) {
				$v = explode('=',$p);
				if (is_array($v) && sizeof($v) > 0) {
					$ret[$v[0]] = $v[1];
				}
			}
		}

		return $ret;
	}

 	/**
 	 * Constructs floor and classmark for Brotherton Library
 	 * @param string $floor - the floor parameter
 	 * @param string $classmark - the classmark parameter
 	 * @return array - the actual floor and classmark paratemter values
 	 */
 	function blLocation($floor,$classmark){
 		$retFloor = $retClassmark = '';

		if (preg_match('/(m[1-4]|w[2-3]a?|mic)/',$floor,$match)) {
			$floor = $match[1];
			$retClassmark = $classmark;

			switch ($floor) {
				case 'mic':
					$retFloor = 'm1';
					break;
				case 'm1':
					$retFloor = 'm1';
					break;
				case 'm2':
					$retFloor = 'm2';
					if (preg_match('/Large Modern History/',$classmark)) {
						$retClassmark = 'Large Modern History';
					}elseif (preg_match('/Modern History [A-P]/',$classmark)) {
						$retClassmark = 'Modern History A-P';
					}elseif (preg_match('/Modern History [Q-Z]/',$classmark)) {
						$retClassmark = 'Modern History P-Z';
					}
					break;
				case 'm3':
					$retFloor = 'm3';
					if (preg_match('/Atlas Case/',$classmark)) {
						$retClassmark = 'Atlases';
					}
					break;
				case 'm4':
					$retFloor = 'm4';
					/*if (preg_match('/English [A-U]/',$classmark)) {
						$retClassmark = 'English A-U';
					}elseif (preg_match('/English [U-V]/',$classmark)) {
						$retClassmark = 'English U-V';
					}*/
					break;
				case 'w2';
					$retFloor = 'w2';
                    if (preg_match('/Stack Large.*/',$classmark)) {
                        $retClassmark = urlencode('All Stack Large A-Z');
                    } 
					break;
				case 'w2a':
					$retFloor = 'w2';
					if (preg_match('/Large [\w ]+ A\-0\.01/',$classmark)) {
                        $retClassmark = urlencode('All Large Journals & Foreign Newspapers');
                    }else if(preg_match('/([\w ]+) A\-0\.01/',$classmark,$journal_matches)) {
                        $retClassmark = urlencode(trim($journal_matches[1]).' Journals');
                    }else if(preg_match('/Newspapers.*/',$classmark)) {
                        $retClassmark = urlencode('All Large Journals & Foreign Newspapers');
                    }
					break;
				case 'w3':
					$retFloor = 'w3';
					if (preg_match('/\w+ A-0.01/',$classmark)) {
						$retClassmark = 'Current Periodicals';
					}
					break;
			}
		}

		return array($retFloor,$retClassmark);
 	}

 	/**
 	 * Constructs floor and classmark for Edward Boyle Library
 	 * @param string $floor - the floor parameter
 	 * @param string $classmark - the classmark parameter
 	 * @return array - the actual floor and classmark paratemter values
 	 */
	function eblLocation($floor,$classmark) {
		$retFloor = $retClassmark = '';

		if (preg_match('/([0-9]{1,2})/',$floor,$match)) {
			$floor = $match[1];
			$retClassmark = $classmark;

			switch($floor) {
				case '8':
					$retFloor = '8';
					break;
				case '11':
					$retFloor = '11';
					if (preg_match('/Large/',$classmark)) {
						$retClassmark = 'Large';
					}
					break;
				case '12':
					$retFloor = 12;
					if (preg_match('/Large/',$classmark)) {
						$retClassmark = 'Large';
					}
					break;
			}
		}

		return array($retFloor,$retClassmark);
	}

	/**
 	 * Constructs floor and classmark for Laidlaw Library
 	 * @param string $floor - the floor parameter
 	 * @param string $classmark - the classmark parameter
 	 * @return array - the actual floor and classmark paratemter values
 	 */
	function hslLocation($floor,$classmark) {
		$retFloor = $retClassmark = '';

		if (preg_match('/(mdl|hslhd)/',$floor,$match)) {
			$$collection = $match[1];
			$retClassmark = $classmark;

			switch($collection) {
				case 'mdl':
					if (preg_match('/Pamphlet/',$classmark)) {
						$retClassmark = 'Pamphlets';
					}
					break;
				case 'hslhd':
					if (preg_match('/VHS Video)|(Audio CD)/',$classmark)) {
						$retClassmark = 'AVC';
					}else {
						$retClassmark = 'HDC';
					}
					break;
				}
			}

			return array($retFloor,$retClassmark);
		}

	/**
 	 * Constructs floor and classmark for Laidlaw Library
 	 * @param string $floor - the floor parameter
 	 * @param string $classmark - the classmark parameter
 	 * @return array - the actual floor and classmark paratemter values
 	 */
	function llLocation($floor,$classmark) {
		$retFloor = $retClassmark = '';

		if (preg_match('/([0-9]|hd)/',$floor,$match)) {
			$floor = $match[1];
			$retClassmark = $classmark;

			switch($floor) {
				case '1':
					$retFloor = 'first';
				break;
				case '2':
					$retFloor = 'second';
				break;
				case '3':
					$retFloor = 'third';
				break;
				case 'hd':
					$retFloor = 'ground';
				break;
			}
		}

		return array($retFloor,$retClassmark);
	}